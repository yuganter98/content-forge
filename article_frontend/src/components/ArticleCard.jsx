import React from 'react';
import { format } from 'date-fns';
import { FaExternalLinkAlt, FaRobot, FaNewspaper } from 'react-icons/fa';

const ArticleCard = ({ article }) => {
    const isEnhanced = article.title.includes('[Enhanced]') || article.title.includes('[Mock-Enhanced]');

    return (
        <div className={`
            relative flex flex-col h-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
            ${isEnhanced ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white border border-purple-500/30' : 'bg-white text-gray-800 border border-gray-100'}
        `}>
            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
                <span className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2
                    ${isEnhanced ? 'bg-purple-500 text-white' : 'bg-blue-100 text-blue-600'}
                `}>
                    {isEnhanced ? <><FaRobot /> Enhanced</> : <><FaNewspaper /> Original</>}
                </span>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                    <h2 className={`text-xl font-bold leading-tight mb-2 ${isEnhanced ? 'text-white' : 'text-gray-900'}`}>
                        {article.title.replace('[Enhanced] ', '').replace('[Mock-Enhanced] ', '')}
                    </h2>
                    <p className={`text-sm ${isEnhanced ? 'text-purple-200' : 'text-gray-500'}`}>
                        {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : 'Date Unknown'}
                    </p>
                </div>

                <div className={`prose prose-sm mb-6 flex-grow line-clamp-4 ${isEnhanced ? 'prose-invert text-purple-100' : 'text-gray-600'}`}>
                    {/* Simple Markdown-ish render (removing basic MD symbols for preview) */}
                    {article.content
                        ? article.content.replace(/[#*`]/g, '').substring(0, 150) + '...'
                        : 'No preview available.'}
                </div>

                <div className="mt-auto pt-4 border-t border-opacity-10 border-gray-500">
                    <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            inline-flex items-center gap-2 text-sm font-semibold transition-colors
                            ${isEnhanced ? 'text-purple-300 hover:text-white' : 'text-blue-600 hover:text-blue-800'}
                        `}
                    >
                        Read Full Article <FaExternalLinkAlt className="text-xs" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
