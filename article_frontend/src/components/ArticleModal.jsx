import React from 'react';
import { format } from 'date-fns';
import { FaTimes, FaRobot, FaNewspaper, FaCalendarAlt, FaLink } from 'react-icons/fa';

const ArticleModal = ({ article, onClose }) => {
    if (!article) return null;

    const isEnhanced = article.title.includes('[Enhanced]') || article.title.includes('[Mock-Enhanced]');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 flex justify-between items-start border-b ${isEnhanced ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white' : 'bg-white text-gray-900'}`}>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${isEnhanced ? 'bg-purple-500/20 border-purple-400 text-purple-100' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
                                {isEnhanced ? 'AI Enhanced' : 'Original Content'}
                            </span>
                            <span className="flex items-center gap-1 text-sm opacity-80">
                                <FaCalendarAlt />
                                {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : 'Date Unknown'}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                            {article.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isEnhanced ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        {/* 
                           We render raw text with simple line breaks for now. 
                           In a real app, use 'react-markdown' to render Markdown properly.
                        */}
                        {article.content ? (
                            article.content.split('\n').map((paragraph, idx) => (
                                paragraph.trim() !== '' && (
                                    <p key={idx} className="mb-4">
                                        {paragraph}
                                    </p>
                                )
                            ))
                        ) : (
                            <p className="italic text-gray-400">No content available for this article.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Article ID: {article.id}
                    </div>
                    <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline font-medium"
                    >
                        View Original Source <FaLink />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;
