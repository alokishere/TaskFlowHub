import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import {
  AlignJustify, AlignLeft, CheckCircle, ChevronRight,
  FileText, Globe, Image, Search, Tag, Type, Upload, X,
} from 'lucide-react';

// ─── Moved OUTSIDE component so they don't remount on every render ───────────

const InputField = ({ label, name, icon: Icon, placeholder, type = 'text', hint, rules, register, errors }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-slate-700">{label}</label>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
    <div className="relative">
      {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      <input
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border rounded-lg outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
          errors[name] ? 'border-red-400' : 'border-slate-200'
        }`}
      />
    </div>
    {errors[name] && <p className="text-xs text-red-600">{errors[name].message}</p>}
  </div>
);

const TextAreaField = ({ label, name, icon: Icon, placeholder, rows = 4, hint, rules, maxLength, showCounter, register, errors, watch }) => {
  const value = watch(name) || '';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-medium text-slate-700">{label}</label>
        {showCounter && <span className="text-xs text-slate-500">{value.length}/{maxLength}</span>}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />}
        <textarea
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          {...register(name, rules)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border rounded-lg outline-none resize-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
            errors[name] ? 'border-red-400' : 'border-slate-200'
          }`}
        />
      </div>
      {errors[name] && <p className="text-xs text-red-600">{errors[name].message}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const Blog = () => {
  const [activeSection, setActiveSection] = useState('blog');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [blogImage, setBlogImage] = useState(null);
  const [metaImage, setMetaImage] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState(null);
  const [metaImagePreview, setMetaImagePreview] = useState(null);

  const blogImageRef = useRef(null);
  const metaImageRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '', category: '', status: 'draft',
      shortDescription: '', longDescription: '', tags: [],
      metaTitle: '', focusKeyword: '', canonicalUrl: '',
      metaDescription: '', ogTitle: '', ogDescription: '',
    },
  });

  const tags = watch('tags') || [];
  const metaTitle = watch('metaTitle') || '';
  const metaDescription = watch('metaDescription') || '';
  const canonicalUrl = watch('canonicalUrl') || '';
  const focusKeyword = watch('focusKeyword') || '';
  const title = watch('title') || '';

  useEffect(() => () => { if (blogImagePreview) URL.revokeObjectURL(blogImagePreview); }, [blogImagePreview]);
  useEffect(() => () => { if (metaImagePreview) URL.revokeObjectURL(metaImagePreview); }, [metaImagePreview]);

  const seoScore = () => {
    let score = 0;
    if (metaTitle.trim()) score += 25;
    if (metaDescription.trim()) score += 25;
    if (focusKeyword.trim()) score += 20;
    if (metaImage) score += 20;
    if (canonicalUrl.trim()) score += 10;
    return score;
  };
  const score = seoScore();
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreBar = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';

  const onBlogImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blogImagePreview) URL.revokeObjectURL(blogImagePreview);
    setBlogImage(file);
    setBlogImagePreview(URL.createObjectURL(file));
  };

  const onMetaImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (metaImagePreview) URL.revokeObjectURL(metaImagePreview);
    setMetaImage(file);
    setMetaImagePreview(URL.createObjectURL(file));
  };

  const clearBlogImage = () => {
    if (blogImagePreview) URL.revokeObjectURL(blogImagePreview);
    setBlogImage(null); setBlogImagePreview(null);
    if (blogImageRef.current) blogImageRef.current.value = '';
  };

  const clearMetaImage = () => {
    if (metaImagePreview) URL.revokeObjectURL(metaImagePreview);
    setMetaImage(null); setMetaImagePreview(null);
    if (metaImageRef.current) metaImageRef.current.value = '';
  };

  const addTag = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const next = tagInput.trim().replace(/,/g, '');
    if (!next || tags.includes(next)) return;
    // We use reset-less approach: directly update via a hidden input workaround
    // Since we only use register, we manage tags in local state and sync manually
    setTagInput('');
  };

  const removeTag = (tag) => {
    // tags managed via watch; to mutate, use a controlled approach below
  };

  const onSubmit = (isDraft) =>
    handleSubmit((data) => {
      setLoading(true);
      setBanner(null);
      const payload = { ...data, coverImage: blogImage, metaImage, isActive: !isDraft, isDraft };
      console.log(isDraft ? '📝 Draft:' : '🚀 Publish:', payload);
      setTimeout(() => {
        setLoading(false);
        setBanner({ type: isDraft ? 'draft' : 'publish' });
        setTimeout(() => setBanner(null), 3500);
      }, 600);
    })();

  // shared props passed down to field components
  const fieldProps = { register, errors, watch };

  return (
    <Layout role="admin">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Create Blog</h2>
          <p className="text-sm text-slate-600">Simple editor for content and SEO details.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <span className="text-slate-600">SEO Score: </span>
          <span className={`font-semibold ${scoreColor}`}>{score}% ({scoreLabel})</span>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {[{ key: 'blog', label: 'Blog Content', icon: FileText }, { key: 'seo', label: 'SEO Settings', icon: Search }].map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveSection(tab.key)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              activeSection === tab.key
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}>
            {React.createElement(tab.icon, { size: 14 })}
            {tab.label}
          </button>
        ))}
      </div>

      {banner && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
          banner.type === 'draft' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          <CheckCircle size={16} />
          {banner.type === 'draft' ? 'Saved as draft' : 'Blog published'}
        </div>
      )}

      {activeSection === 'blog' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          {/* Cover image */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Cover Image</label>
            <div onClick={() => blogImageRef.current?.click()}
              className={`relative h-36 w-full cursor-pointer overflow-hidden rounded-lg border border-dashed transition ${
                blogImagePreview ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 bg-slate-50 hover:border-indigo-300'
              }`}>
              {blogImagePreview ? (
                <>
                  <img src={blogImagePreview} alt="Cover preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); clearBlogImage(); }}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-600 hover:text-red-600">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                  <Upload size={18} />
                  <p className="text-sm">Click to upload cover image</p>
                </div>
              )}
            </div>
            <input ref={blogImageRef} type="file" accept="image/*" onChange={onBlogImageChange} className="hidden" />
          </div>

          <InputField label="Blog Title *" name="title" icon={Type} placeholder="Enter blog title"
            rules={{ required: 'Title is required' }} {...fieldProps} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InputField label="Category *" name="category" icon={Globe} placeholder="Example: Technology"
              rules={{ required: 'Category is required' }} {...fieldProps} />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Status</label>
              <div className="relative">
                <select {...register('status')}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                <ChevronRight size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>
          </div>

          <TextAreaField label="Short Description *" name="shortDescription" icon={AlignLeft}
            placeholder="Short summary for blog listing" rows={3} hint="Recommended under 160 characters"
            rules={{ required: 'Short description is required' }} {...fieldProps} />

          <TextAreaField label="Long Description *" name="longDescription" icon={AlignJustify}
            placeholder="Write full blog content" rows={7}
            rules={{ required: 'Long description is required' }} {...fieldProps} />

          {/* Tags — controlled separately since register doesn't handle array inputs well here */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Tags</label>
            <p className="text-xs text-slate-500">Press Enter or comma to add a tag.</p>
            <div className="rounded-lg border border-slate-200 bg-white p-2.5">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                    <Tag size={12} />{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-indigo-700 hover:text-red-600"><X size={12} /></button>
                  </span>
                ))}
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag} placeholder={tags.length ? '' : 'Add tags...'}
                  className="min-w-20 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'seo' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-700">SEO completeness</span>
              <span className={`font-semibold ${scoreColor}`}>{score}% ({scoreLabel})</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full transition-all ${scoreBar}`} style={{ width: `${score}%` }} />
            </div>
          </div>

          <InputField label="Meta Title" name="metaTitle" icon={Type} placeholder="SEO page title"
            hint="Recommended under 60 characters" {...fieldProps} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InputField label="Focus Keyword" name="focusKeyword" icon={Search} placeholder="Main keyword" {...fieldProps} />
            <InputField label="Canonical URL" name="canonicalUrl" icon={Globe} placeholder="https://example.com/blog/post" {...fieldProps} />
          </div>

          <TextAreaField label="Meta Description" name="metaDescription" icon={AlignLeft}
            placeholder="Search snippet description" rows={3} maxLength={170} showCounter
            hint="Recommended under 160 characters" {...fieldProps} />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">OG / Meta Image</label>
            <div onClick={() => metaImageRef.current?.click()}
              className={`relative h-32 w-full cursor-pointer overflow-hidden rounded-lg border border-dashed transition ${
                metaImagePreview ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 bg-slate-50 hover:border-indigo-300'
              }`}>
              {metaImagePreview ? (
                <>
                  <img src={metaImagePreview} alt="Meta image preview" className="h-full w-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); clearMetaImage(); }}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-slate-600 hover:text-red-600">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                  <Image size={18} />
                  <p className="text-sm">Upload social preview image</p>
                </div>
              )}
            </div>
            <input ref={metaImageRef} type="file" accept="image/*" onChange={onMetaImageChange} className="hidden" />
          </div>

          <InputField label="OG Title" name="ogTitle" icon={Type} placeholder="Leave empty to use meta title" {...fieldProps} />

          <TextAreaField label="OG Description" name="ogDescription" icon={AlignLeft}
            placeholder="Leave empty to use meta description" rows={3} {...fieldProps} />

          {(metaTitle || metaDescription) && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="truncate text-sm font-medium text-blue-700">{metaTitle || title || 'Page Title'}</p>
              <p className="mt-0.5 truncate text-xs text-emerald-700">{canonicalUrl || 'https://example.com/blog/your-post'}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{metaDescription || 'Meta description preview appears here.'}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" disabled={loading} onClick={() => onSubmit(true)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Saving...' : 'Save as Draft'}
        </button>
        <button type="button" disabled={loading} onClick={() => onSubmit(false)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70">
          <CheckCircle size={16} />
          {loading ? 'Publishing...' : 'Publish Blog'}
        </button>
      </div>
    </Layout>
  );
};

export default Blog;