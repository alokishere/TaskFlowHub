import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { File, Search, Download, User, Calendar, Trash2 } from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';
import { useAllDocuments } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Documents = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useAllDocuments();

  const deleteDocMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
    },
    onError: () => { alert('Failed'); }
  });

  const deleteDoc = (id) => {
    if (window.confirm('Delete document?')) {
      deleteDocMutation.mutate(id);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.docType.toLowerCase().includes(search.toLowerCase()) || 
    d.user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Global Documents</h2>
          <p className="text-gray-500">Manage all employee files and identification documents.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by document type or employee name..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all border border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div key={doc._id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-purple-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <File size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <a href={`${imageBaseUrl}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50"><Download size={16}/></a>
                    <button onClick={() => deleteDoc(doc._id)} disabled={deleteDocMutation.isPending} className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"><Trash2 size={16}/></button>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{doc.docType}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
                  <User size={12} /> {doc.user.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                  <Calendar size={10} /> Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredDocs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <File size={48} className="mx-auto mb-4 opacity-20" />
            <p>No documents found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
