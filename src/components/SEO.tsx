import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
}

export default function SEO({
  title = "MyWorkspace - Notes, Todo, Music & Clock in One Place",
  description = "Minimalist productivity workspace with Notes, Todo List, Spotify Music Player, Clock, Stopwatch and Timer.",
  keywords = "productivity, notes, todo list, spotify player, clock, stopwatch, timer, minimal workspace"
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, value: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let el = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:url', window.location.href, true);
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);

    // Structured Data JSON-LD
    let scriptEl = document.getElementById('jsonld-seo') as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'jsonld-seo';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "MyWorkspace",
      "url": window.location.origin,
      "description": description,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "All"
    });
  }, [title, description, keywords]);

  return null;
}
