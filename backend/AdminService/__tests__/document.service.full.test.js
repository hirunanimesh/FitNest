import { jest } from '@jest/globals';
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

  const e = { __esModule: true, ...defaultEmbeddings, ...embeddings };

  await jest.unstable_mockModule('../services/embedding.service.js', () => e);

  const s = {
    from: jest.fn(),
    rpc: jest.fn(),
    ...supabaseImpl,
  };

  await jest.unstable_mockModule('../database/supabase.js', () => ({
    __esModule: true,
    supabase: s,
    default: s,
  }));

  const mod = await import('../services/document.service.js');
  const supa = (await import('../database/supabase.js')).supabase;
  const emb = await import('../services/embedding.service.js');
  return { mod, supabase: supa, embedding: emb };
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
    let idCounter = 100;
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          insert: () => buildInsertBuilder(async () => ({ data: { id: idCounter++ }, error: null })),
        })),
      },
    });

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
      supabaseImpl: {
        from: jest.fn(() => ({
          insert: () => buildInsertBuilder(async () => ({ data: { id: 'x' }, error: null })),
        })),
      },
    });

    await expect(mod.uploadDocumentsToRAG(['a', 'b'])).rejects.toThrow('Mismatch between documents and embeddings count');
  });

  test('uploadDocumentsToRAG - handles per-document insert errors and continues', async () => {
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          insert: () => buildInsertBuilder(() => (call++ === 0 ? singleOk() : singleErr())),
        })),
      },
    });
    const singleOk = async () => ({ data: { id: 201 }, error: null });
    const singleErr = async () => ({ data: null, error: { message: 'dup key' } });
    let call = 0;

    const res = await mod.uploadDocumentsToRAG(['first', 'second']);
    expect(res.success).toBe(true);
    expect(res.insertedCount).toBe(1);
    expect(res.insertedIds).toEqual([201]);
    expect(res.errors).toEqual([{ index: 1, error: 'dup key' }]);
  });

  test('searchSimilarDocuments - success', async () => {
    const { mod, embedding } = await loadWithMocks({
      supabaseImpl: {
        rpc: jest.fn().mockResolvedValue({ data: [{ id: 1, content: 'match' }], error: null }),
      },
    });
    const res = await mod.searchSimilarDocuments('query', 3);
    expect(embedding.generateEmbedding).toHaveBeenCalled();
    expect(res).toEqual({ success: true, results: [{ id: 1, content: 'match' }], count: 1 });
  });

  test('searchSimilarDocuments - rpc error surfaces', async () => {
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        rpc: jest.fn().mockResolvedValue({ data: null, error: { message: 'rpc boom' } }),
      },
    });
    await expect(mod.searchSimilarDocuments('q')).rejects.toThrow('Search failed: rpc boom');
  });

  test('getAllDocuments - paginated success with flags', async () => {
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          select: () => buildSelectRangeBuilder(async () => ({
            data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
            error: null,
            count: 15,
          })),
        })),
      },
    });

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
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          select: () => buildSelectRangeBuilder(async () => ({ data: null, error: { message: 'select fail' }, count: 0 })),
        })),
      },
    });

    await expect(mod.getAllDocuments(1, 10)).rejects.toThrow('Failed to fetch documents: select fail');
  });

  test('deleteDocument - success', async () => {
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          delete: () => ({ eq: async () => ({ error: null }) }),
        })),
      },
    });

    const res = await mod.deleteDocument('abc');
    expect(res).toEqual({ success: true, message: 'Document abc deleted successfully' });
  });

  test('deleteDocument - error surfaces', async () => {
    const { mod } = await loadWithMocks({
      supabaseImpl: {
        from: jest.fn(() => ({
          delete: () => ({ eq: async () => ({ error: { message: 'nope' } }) }),
        })),
      },
    });

    await expect(mod.deleteDocument('xyz')).rejects.toThrow('Failed to delete document: nope');
  });
});
