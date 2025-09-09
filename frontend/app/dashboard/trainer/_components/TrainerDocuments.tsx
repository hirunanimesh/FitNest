"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTrainerData } from '../context/TrainerContext';
import { uploadToCloudinary } from '@/lib/api';

type DocItem = {
  id?: string | number;
  name?: string;
  url: string;
  type?: string;
  uploadedAt?: string;
  description?: string;
};

function normalizeDocs(docs: any): DocItem[] {
  if (!docs) return [];
  if (Array.isArray(docs)) return docs;
  if (typeof docs === 'string') {
    try {
      const parsed = JSON.parse(docs);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [{ name: docs, url: docs } as DocItem];
    }
  }
  return [docs];
}

const isImage = (url: string | undefined) => {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url);
};

const TrainerDocuments: React.FC<{ editable?: boolean }> = ({ editable = false }) => {
  const { trainerData, addDocument, removeDocument, setDocuments, saveDocuments } = useTrainerData();
  const [localDocs, setLocalDocs] = useState<DocItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalDocs(normalizeDocs(trainerData?.documents));
  }, [trainerData?.documents]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading...');
    try {
      const url = await uploadToCloudinary(file);
      const doc: DocItem = {
        id: Date.now(),
        name: file.name,
        url,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        description: '',
      };
      // prefer context helper if available
      if (addDocument) addDocument(doc);
      else {
        const next = [...localDocs, doc];
        setLocalDocs(next);
        if (setDocuments) setDocuments(next);
      }
      setStatus('Uploaded');
    } catch (err) {
      console.error('Upload failed', err);
      setStatus('Upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      setTimeout(() => setStatus(null), 1500);
    }
  };

  const handleRemove = (index: number) => {
    if (removeDocument) removeDocument(index);
    const next = localDocs.filter((_, i) => i !== index);
    setLocalDocs(next);
    if (setDocuments) setDocuments(next);
  };

  const handleFieldChange = (index: number, field: keyof DocItem, value: any) => {
    const next = localDocs.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    setLocalDocs(next);
    if (setDocuments) setDocuments(next);
  };

  const handleSaveAll = async () => {
    if (!saveDocuments) return;
    setIsSaving(true);
    setStatus('Saving...');
    try {
      await saveDocuments();
      setStatus('Saved');
    } catch (err) {
      console.error('Failed to save documents', err);
      setStatus('Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 1200);
    }
  };

  return (
    <div className="mt-6 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Documents</h3>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
          {editable && (
            <>
              <span onClick={() => inputRef.current?.click()} className="text-sm text-gray-300 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md cursor-pointer">Upload</span>
              <button onClick={handleSaveAll} disabled={isSaving} className="text-sm bg-green-600 text-white px-3 py-1 rounded-md">{isSaving ? 'Saving...' : 'Save'}</button>
            </>
          )}
        </div>
      </div>

      {status && <div className="text-sm text-gray-300 mb-2">{status}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {localDocs.length === 0 && (
          <div className="text-sm text-gray-400">No documents uploaded yet.</div>
        )}

        {localDocs.map((doc, idx) => (
          <div key={doc.id ?? doc.url ?? idx} className="bg-gray-800 rounded p-2 flex flex-col items-center">
            <div className="w-full h-28 bg-gray-700 rounded overflow-hidden mb-2 flex items-center justify-center">
              {doc.type?.startsWith('image') || isImage(doc.url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.url} alt={doc.name || 'doc'} className="object-cover w-full h-full" />
              ) : doc.type === 'application/pdf' || (doc.url && doc.url.toLowerCase().endsWith('.pdf')) ? (
                <div className="flex flex-col items-center text-gray-200">
                  <div className="w-12 h-12 bg-red-600 rounded flex items-center justify-center font-bold">PDF</div>
                </div>
              ) : (
                <div className="text-gray-200">{doc.name?.split('.').pop()?.toUpperCase() || 'FILE'}</div>
              )}
            </div>
            <div className="w-full text-sm text-gray-100 truncate text-center mb-2">{doc.name}</div>
            {editable && (
              <textarea value={doc.description || ''} onChange={(e) => handleFieldChange(idx, 'description', e.target.value)} className="w-full bg-gray-700 text-white p-1 text-xs rounded mb-2" placeholder="Description (optional)" rows={2} />
            )}
            <div className="w-full flex justify-between items-center gap-2">
              {editable ? (
                <button onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-500 flex items-center gap-1 text-sm">Remove</button>
              ) : (
                <div />
              )}
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-sky-400">Open</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerDocuments;
