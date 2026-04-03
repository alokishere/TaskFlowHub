import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API, { imageBaseUrl } from '../../services/api';
import { Search, Eye, Edit, Trash2, Power, FileText } from 'lucide-react';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBlogs = async () => {
    try {
      const { data } = await API.get('/blogs/get');
      setBlogs(data.data || []);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return blogs;

    return blogs.filter((blog) =>
      [blog.title, blog.category, blog.shortDescription, ...(blog.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [blogs, search]);

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;

    try {
      await API.delete(`/blogs/delete/${id}`);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (error) {
      alert('Failed to delete blog');
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const { data } = await API.patch(`/blogs/status/${id}`, { isActive: !isActive });
      setBlogs((prev) => prev.map((blog) => (blog._id === id ? data.data : blog)));
    } catch (error) {
      alert('Failed to update blog status');
    }
  };

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Blog List</h2>
          <p className="text-sm text-slate-600">Manage all blogs, status, and preview.</p>
        </div>
        <Link
          to="/admin/blog/create"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Create Blog
        </Link>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, description, or tag"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {blog.coverImage ? (
              <img src={`${imageBaseUrl}${blog.coverImage}`} alt={blog.title} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 w-full items-center justify-center bg-slate-100 text-slate-400">
                <FileText size={30} />
              </div>
            )}

            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${blog.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {blog.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                  {blog.status}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{blog.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{blog.category}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{blog.shortDescription}</p>
              </div>

              {!!blog.tags?.length && (
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.slice(0, 5).map((tag) => (
                    <span key={`${blog._id}-${tag}`} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleActive(blog._id, blog.isActive)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${blog.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                >
                  <Power size={13} />
                  {blog.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <Link
                  to={`/admin/blog/preview/${blog._id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-200"
                >
                  <Eye size={13} />
                  Preview
                </Link>

                <Link
                  to={`/admin/blog/edit/${blog._id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-200"
                >
                  <Edit size={13} />
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => deleteBlog(blog._id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          No blogs found.
        </div>
      )}
    </Layout>
  );
};

export default BlogList;
