import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import {
  FileText, Search, Type, AlignLeft, AlignJustify,
  Image, Upload, Tag, Globe, CheckCircle, X, Plus,
  ChevronRight, Eye, EyeOff
} from 'lucide-react';
import API from '../../services/api';

const Blog = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('blog');
  const [tagInput, setTagInput] = useState('');

  // Blog fields
  const [blogData, setBlogData] = useState({
    title: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    status: 'draft',
    tags: [],
  });
  const [blogImage, setBlogImage] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState(null);

  // SEO fields
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    focusKeyword: '',
  });
  const [metaImage, setMetaImage] = useState(null);
  const [metaImagePreview, setMetaImagePreview] = useState(null);

  const blogImageRef = useRef();
  const metaImageRef = useRef();

  const handleBlogChange = (e) => {
    setBlogData({ ...blogData, [e.target.name]: e.target.value });
  };

  const handleSeoChange = (e) => {
    setSeoData({ ...seoData, [e.target.name]: e.target.value });
  };

  const handleBlogImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImage(file);
      setBlogImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMetaImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMetaImage(file);
      setMetaImagePreview(URL.createObjectURL(file));
    }
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(',', '');
      if (!blogData.tags.includes(newTag)) {
        setBlogData({ ...blogData, tags: [...blogData.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setBlogData({ ...blogData, tags: blogData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const data = new FormData();
    Object.keys(blogData).forEach(key => {
      if (key === 'tags') {
        data.append('tags', JSON.stringify(blogData.tags));
      } else if (blogData[key]) {
        data.append(key, blogData[key]);
      }
    });
    Object.keys(seoData).forEach(key => {
      if (seoData[key]) data.append(key, seoData[key]);
    });
    if (blogImage) data.append('image', blogImage);
    if (metaImage) data.append('metaImage', metaImage);

    try {
      await API.post('/blogs', data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder = '', hint = '' }) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{label}</label>
      {hint && <p className="text-[10px] text-gray-400 ml-4 -mt-1">{hint}</p>}
      <div className="relative">
        {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-12' : 'pl-5'} pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-sm shadow-inner placeholder:text-gray-300 placeholder:font-medium`}
        />
      </div>
    </div>
  );

  const TextAreaField = ({ icon: Icon, label, name, value, onChange, placeholder = '', rows = 4, hint = '' }) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{label}</label>
      {hint && <p className="text-[10px] text-gray-400 ml-4 -mt-1">{hint}</p>}
      <div className="relative">
        {Icon && <Icon className="absolute left-5 top-5 text-gray-400" size={16} />}
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full ${Icon ? 'pl-12' : 'pl-5'} pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-sm shadow-inner resize-none placeholder:text-gray-300 placeholder:font-medium`}
        />
      </div>
    </div>
  );

  const seoScore = () => {
    let score = 0;
    if (seoData.metaTitle) score += 25;
    if (seoData.metaDescription) score += 25;
    if (seoData.focusKeyword) score += 20;
    if (metaImage) score += 20;
    if (seoData.canonicalUrl) score += 10;
    return score;
  };

  const score = seoScore();
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';

  return (
    <Layout role="admin">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Create New Blog</h2>
          <p className="text-sm font-medium text-gray-500">Fill in the blog content and SEO details below.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SEO Score:</span>
          <span className={`text-sm font-black ${scoreColor}`}>{score}% — {scoreLabel}</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'blog', label: 'Blog Content', icon: FileText },
          { key: 'seo', label: 'SEO Settings', icon: Search },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSection === key
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                : 'bg-white text-gray-400 border border-gray-100 hover:border-purple-100 hover:text-purple-500'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-emerald-100 shadow-sm animate-bounce">
            <CheckCircle size={18} />
            Blog created successfully!
          </div>
        )}

        {/* ─── BLOG SECTION ─── */}
        {activeSection === 'blog' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-10 space-y-10">

            {/* Cover Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Cover Image</label>
              <div
                onClick={() => blogImageRef.current.click()}
                className={`relative w-full h-56 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group
                  ${blogImagePreview ? 'border-purple-200' : 'border-gray-200 hover:border-purple-300 bg-gray-50/50'}`}
              >
                {blogImagePreview ? (
                  <>
                    <img src={blogImagePreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                      <Upload className="text-white" size={28} />
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setBlogImage(null); setBlogImagePreview(null); }}
                      className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 text-gray-600 hover:text-red-500 transition-colors shadow"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                      <Image className="text-purple-400" size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-500">Click to upload cover image</p>
                      <p className="text-xs font-medium text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
                <input ref={blogImageRef} type="file" className="hidden" onChange={handleBlogImage} accept="image/*" />
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="sm:col-span-2">
                <InputField
                  icon={Type}
                  label="Blog Title"
                  name="title"
                  value={blogData.title}
                  onChange={handleBlogChange}
                  placeholder="Enter a compelling blog title..."
                />
              </div>

              <InputField
                icon={Globe}
                label="Category"
                name="category"
                value={blogData.category}
                onChange={handleBlogChange}
                placeholder="e.g. Technology, Health..."
              />

              {/* Status */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Status</label>
                <div className="relative">
                  <Eye className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    name="status"
                    value={blogData.status}
                    onChange={handleBlogChange}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-sm shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Short Description */}
            <TextAreaField
              icon={AlignLeft}
              label="Short Description"
              name="shortDescription"
              value={blogData.shortDescription}
              onChange={handleBlogChange}
              placeholder="Write a brief summary shown in blog cards and listings..."
              rows={3}
              hint="Shown in blog listing cards — keep it under 160 characters"
            />

            {/* Long Description */}
            <TextAreaField
              icon={AlignJustify}
              label="Long Description / Content"
              name="longDescription"
              value={blogData.longDescription}
              onChange={handleBlogChange}
              placeholder="Write the full blog content here... You can use markdown syntax."
              rows={10}
              hint="Main body of your blog post — supports markdown"
            />

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tags</label>
              <p className="text-[10px] text-gray-400 ml-4">Press Enter or comma to add a tag</p>
              <div className="bg-gray-50/50 rounded-2xl border border-transparent focus-within:bg-white focus-within:border-purple-200 transition-all p-4 shadow-inner min-h-14">
                <div className="flex flex-wrap gap-2">
                  {blogData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl text-xs font-black">
                      <Tag size={10} />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors ml-0.5">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={blogData.tags.length === 0 ? "Add tags..." : ""}
                    className="bg-transparent outline-none text-sm font-bold min-w-25 placeholder:text-gray-300 placeholder:font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SEO SECTION ─── */}
        {activeSection === 'seo' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-10 space-y-10">

            {/* SEO Score Bar */}
            <div className="p-5 bg-gray-50/60 rounded-3xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">SEO Score</span>
                <span className={`text-sm font-black ${scoreColor}`}>{score}% — {scoreLabel}</span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreBg}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {[
                  { label: 'Meta Title', done: !!seoData.metaTitle },
                  { label: 'Meta Desc', done: !!seoData.metaDescription },
                  { label: 'Keyword', done: !!seoData.focusKeyword },
                  { label: 'OG Image', done: !!metaImage },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${item.done ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Title & Keyword */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="sm:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta Title</label>
                    <span className={`text-[10px] font-black ${seoData.metaTitle.length > 60 ? 'text-red-400' : 'text-gray-400'}`}>
                      {seoData.metaTitle.length}/60
                    </span>
                  </div>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="metaTitle"
                      value={seoData.metaTitle}
                      onChange={handleSeoChange}
                      placeholder="SEO-optimized page title..."
                      maxLength={70}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-sm shadow-inner placeholder:text-gray-300 placeholder:font-medium"
                    />
                  </div>
                </div>
              </div>

              <InputField
                icon={Search}
                label="Focus Keyword"
                name="focusKeyword"
                value={seoData.focusKeyword}
                onChange={handleSeoChange}
                placeholder="Primary target keyword..."
              />

              <InputField
                icon={Globe}
                label="Canonical URL"
                name="canonicalUrl"
                value={seoData.canonicalUrl}
                onChange={handleSeoChange}
                placeholder="https://yourdomain.com/blog/..."
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta Description</label>
                <span className={`text-[10px] font-black ${seoData.metaDescription.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>
                  {seoData.metaDescription.length}/160
                </span>
              </div>
              <p className="text-[10px] text-gray-400 ml-4">Shown as page snippet in Google search results</p>
              <div className="relative">
                <AlignLeft className="absolute left-5 top-5 text-gray-400" size={16} />
                <textarea
                  name="metaDescription"
                  value={seoData.metaDescription}
                  onChange={handleSeoChange}
                  placeholder="Concise description of the page content for search engines..."
                  rows={3}
                  maxLength={170}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-bold text-sm shadow-inner resize-none placeholder:text-gray-300 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Divider: Open Graph */}
            <div className="flex items-center gap-4">
              <div className="h-px bg-gray-100 flex-1" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Open Graph (Social Sharing)</span>
              <div className="h-px bg-gray-100 flex-1" />
            </div>

            {/* OG Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">OG / Meta Image</label>
              <p className="text-[10px] text-gray-400 ml-4">Recommended: 1200×630px — shown when shared on social media</p>
              <div
                onClick={() => metaImageRef.current.click()}
                className={`relative w-full h-44 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group
                  ${metaImagePreview ? 'border-purple-200' : 'border-gray-200 hover:border-purple-300 bg-gray-50/50'}`}
              >
                {metaImagePreview ? (
                  <>
                    <img src={metaImagePreview} alt="OG" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                      <Upload className="text-white" size={24} />
                      <span className="text-white text-xs font-black uppercase tracking-widest">Change Image</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setMetaImage(null); setMetaImagePreview(null); }}
                      className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 text-gray-600 hover:text-red-500 transition-colors shadow"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                      <Image className="text-purple-400" size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-500">Upload OG image</p>
                      <p className="text-xs font-medium text-gray-400 mt-0.5">1200×630px recommended</p>
                    </div>
                  </div>
                )}
                <input ref={metaImageRef} type="file" className="hidden" onChange={handleMetaImage} accept="image/*" />
              </div>
            </div>

            {/* OG Title & Description */}
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              <InputField
                icon={Type}
                label="OG Title (Social Title)"
                name="ogTitle"
                value={seoData.ogTitle}
                onChange={handleSeoChange}
                placeholder="Leave blank to use Meta Title..."
              />
              <TextAreaField
                icon={AlignLeft}
                label="OG Description (Social Description)"
                name="ogDescription"
                value={seoData.ogDescription}
                onChange={handleSeoChange}
                placeholder="Leave blank to use Meta Description..."
                rows={3}
              />
            </div>

            {/* Live Search Preview */}
            {(seoData.metaTitle || seoData.metaDescription) && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Google Search Preview</label>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-blue-600 text-base font-semibold truncate hover:underline cursor-pointer">
                    {seoData.metaTitle || blogData.title || 'Page Title'}
                  </p>
                  <p className="text-green-700 text-xs mt-0.5 font-medium">
                    {seoData.canonicalUrl || 'https://yourdomain.com/blog/your-post'}
                  </p>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    {seoData.metaDescription || 'Meta description will appear here in search results...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            type="button"
            onClick={() => setBlogData({ ...blogData, status: 'draft' })}
            className="flex-1 sm:flex-none px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest py-5 rounded-3xl transition-all active:scale-95"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest py-5 rounded-3xl transition-all shadow-lg shadow-purple-200 disabled:opacity-70 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'Publishing...' : (
              <>
                <CheckCircle size={16} />
                Publish Blog
              </>
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Blog;