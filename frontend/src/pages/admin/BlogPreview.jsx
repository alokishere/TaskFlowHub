import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { imageBaseUrl } from '../../services/api';
import { ArrowLeft, Calendar, Tag, Edit } from 'lucide-react';
import { useBlogDetails } from '../../hooks/useQueries';

const BlogPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading } = useBlogDetails(id);

  if (isLoading) {
    return (
      <Layout role="admin">
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout role="admin">
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          Blog not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/blog/list')}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Blog Preview</h2>
            <p className="text-sm text-slate-600">Review published content and SEO details.</p>
          </div>
        </div>

        <Link
          to={`/admin/blog/edit/${blog._id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Edit size={15} />
          Edit Blog
        </Link>
      </div>

      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {blog.coverImage && (
          <img
            src={`${imageBaseUrl}${blog.coverImage}`}
            alt={blog.title}
            className="h-64 w-full object-cover"
          />
        )}

        <div className="space-y-5 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${blog.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {blog.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
              {blog.status}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} />
              {new Date(blog.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{blog.title}</h1>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-slate-500">{blog.category}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{blog.shortDescription}</p>
          </div>

          {!!blog.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-slate max-w-none whitespace-pre-line text-sm leading-7 text-slate-700">
            {blog.longDescription}
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">Meta Title</p>
              <p className="mt-1 text-sm text-slate-700">{blog.metaTitle || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">Focus Keyword</p>
              <p className="mt-1 text-sm text-slate-700">{blog.focusKeyword || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">Canonical URL</p>
              <p className="mt-1 break-all text-sm text-slate-700">{blog.canonicalUrl || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">OG Title</p>
              <p className="mt-1 text-sm text-slate-700">{blog.ogTitle || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <p className="text-xs font-semibold text-slate-500">Meta Description</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{blog.metaDescription || '-'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
              <p className="text-xs font-semibold text-slate-500">OG Description</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{blog.ogDescription || '-'}</p>
            </div>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPreview;
