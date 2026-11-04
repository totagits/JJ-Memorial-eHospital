import React, { useState } from 'react';
import { dbStore } from '../../services/dbStore';
import { HospitalNewsItem } from '../../types';
import { useTranslation } from '../../services/i18n';
import { Newspaper, Calendar, Clock, User, ArrowRight, X, BookmarkCheck } from 'lucide-react';

export const HospitalNews: React.FC = () => {
  const { t } = useTranslation();
  const newsItems = dbStore.getNewsItems();
  const [selectedArticle, setSelectedArticle] = useState<HospitalNewsItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Hospital Update', 'Public Health', 'Maternal Care'];

  const filteredNews = activeCategory === 'All'
    ? newsItems
    : newsItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Public Health Bulletins & Community News</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-hospital-navy tracking-tight">
              {t('hospitalNews')}
            </h2>
            <p className="text-slate-600 text-base">
              Timely medical insights, preventive health updates, and service announcements from our clinical departments.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-hospital-navy text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                    {article.category}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-hospital-navy group-hover:text-teal-600 transition leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium truncate max-w-[140px]">{article.author}</span>
                </div>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-800 transition"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-block">
                {selectedArticle.category}
              </span>

              <h2 className="text-2xl font-extrabold text-hospital-navy">
                {selectedArticle.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedArticle.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedArticle.readTime}
                </span>
              </div>
            </div>

            <div className="prose text-sm text-slate-700 leading-relaxed space-y-4">
              <p className="font-medium text-slate-800 text-base">
                {selectedArticle.summary}
              </p>
              <p>{selectedArticle.content}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <BookmarkCheck className="w-4 h-4 text-teal-600" />
                Verified Hospital Advisory
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
