// Comprehensive tests for document.service.js covering success and error paths
const loadWithMocks = async ({
  embeddings = {},
  supabaseImpl = {},
} = {}) => {
  jest.resetModules();
  jest.clearAllMocks();

  const defaultEmbeddings = {
    generateBatchEmbeddings: jest.fn(async (docs) =>
      docs.map((_, i) => Array.from({ length: 1024 }, () => (i + 1) / 1024))
    ),
    generateEmbedding: jest.fn(async () => Array.from({ length: 1024 }, () => 0.5)),
  };

  const e = { ...defaultEmbeddings, ...embeddings };

  jest.doMock('../services/embedding.service.js', () => ({
    __esModule: true,
    ...e,
  }));

  const fromMock = jest.fn();
  const rpcMock = jest.fn();

  const s = {
    from: fromMock,
    rpc: rpcMock,
    ...supabaseImpl,
  };

  jest.doMock('../database/supabase.js', () => ({
    __esModule: true,
    supabase: s,
    default: s,
  }));

  const mod = await import('../services/document.service.js');
  const supa = (await import('../database/supabase.js')).supabase;
  const emb = await import('../services/embedding.service.js');
  return { mod, supabase: supa, embedding: emb, fromMock, rpcMock };
};

// Helpers to build chainable mocks
const buildInsertBuilder = (singleImpl) => ({
  select: () => ({
    single: singleImpl,
  }),
});
const buildSelectRangeBuilder = (rangeImpl) => ({ range: rangeImpl });

describe('document.service - full coverage', () => {
  test('uploadDocumentsToRAG - happy path inserts all docs', async () => {
    const { mod, supabase } = await loadWithMocks();
    let idCounter = 100;
    supabase.from.mockImplementation(() => ({
      insert: () => buildInsertBuilder(async () => ({ data: { id: idCounter++ }, error: null })),
    }));

    const res = await mod.uploadDocumentsToRAG(['doc one', 'doc two']);
    expect(res.success).toBe(true);
    expect(res.insertedCount).toBe(2);
    expect(res.insertedIds).toEqual([100, 101]);
    expect(res.totalDocuments).toBe(2);
    expect(res.errors).toBeUndefined();
  });

  test('uploadDocumentsToRAG - throws when no valid documents', async () => {
    const { mod } = await loadWithMocks();
    await expect(mod.uploadDocumentsToRAG(['', '   '])).rejects.toThrow('No valid documents provided');
  });

  test('uploadDocumentsToRAG - mismatch between documents and embeddings count', async () => {
    const { mod } = await loadWithMocks({
      embeddings: {
        generateBatchEmbeddings: jest.fn(async () => [Array(1024).fill(0.1)]),
      },
    });

    await expect(mod.uploadDocumentsToRAG(['a', 'b'])).rejects.toThrow('Mismatch between documents and embeddings count');
  });

  test('uploadDocumentsToRAG - handles per-document insert errors and continues', async () => {
    const { mod, supabase } = await loadWithMocks();
    const singleOk = async () => ({ data: { id: 201 }, error: null });
    const singleErr = async () => ({ data: null, error: { message: 'dup key' } });
    let call = 0;
    supabase.from.mockImplementation(() => ({
      insert: () => buildInsertBuilder(() => (call++ === 0 ? singleOk() : singleErr())),
    }));

    const res = await mod.uploadDocumentsToRAG(['first', 'second']);
    expect(res.success).toBe(true);
    expect(res.insertedCount).toBe(1);
    expect(res.insertedIds).toEqual([201]);
    expect(res.errors).toEqual([{ index: 1, error: 'dup key' }]);
  });

  test('searchSimilarDocuments - success', async () => {
    const { mod, supabase, embedding } = await loadWithMocks();
    supabase.rpc.mockResolvedValue({ data: [{ id: 1, content: 'match' }], error: null });
    const res = await mod.searchSimilarDocuments('query', 3);
    expect(embedding.generateEmbedding).toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalledWith('match_documents', expect.any(Object));
    expect(res).toEqual({ success: true, results: [{ id: 1, content: 'match' }], count: 1 });
  });

  test('searchSimilarDocuments - rpc error surfaces', async () => {
    const { mod, supabase } = await loadWithMocks();
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'rpc boom' } });
    await expect(mod.searchSimilarDocuments('q')).rejects.toThrow('Search failed: rpc boom');
  });

  test('getAllDocuments - paginated success with flags', async () => {
    const { mod, supabase } = await loadWithMocks();
    supabase.from.mockImplementation(() => ({
      select: () => buildSelectRangeBuilder(async () => ({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
        error: null,
        count: 15,
      })),
    }));

    const res = await mod.getAllDocuments(2, 5);
    expect(res.success).toBe(true);
    expect(res.documents).toHaveLength(5);
    expect(res.pagination).toEqual({
      currentPage: 2,
      totalCount: 15,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  test('getAllDocuments - error bubbles', async () => {
    const { mod, supabase } = await loadWithMocks();
    supabase.from.mockImplementation(() => ({
      select: () => buildSelectRangeBuilder(async () => ({ data: null, error: { message: 'select fail' }, count: 0 })),
    }));

    await expect(mod.getAllDocuments(1, 10)).rejects.toThrow('Failed to fetch documents: select fail');
  });

  test('deleteDocument - success', async () => {
    const { mod, supabase } = await loadWithMocks();
    supabase.from.mockImplementation(() => ({
      delete: () => ({ eq: async () => ({ error: null }) }),
    }));

    const res = await mod.deleteDocument('abc');
    expect(res).toEqual({ success: true, message: 'Document abc deleted successfully' });
  });

  test('deleteDocument - error surfaces', async () => {
    const { mod, supabase } = await loadWithMocks();
    supabase.from.mockImplementation(() => ({
      delete: () => ({ eq: async () => ({ error: { message: 'nope' } }) }),
    }));

    await expect(mod.deleteDocument('xyz')).rejects.toThrow('Failed to delete document: nope');
  });
});
