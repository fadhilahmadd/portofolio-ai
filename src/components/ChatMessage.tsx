import { useState, useEffect, useMemo, Children, isValidElement, FC, ReactNode, ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Clipboard, Check, ArrowUpRight, Mail } from 'lucide-react';
import { Message } from '@/types';
import { AudioPlayer } from './AudioPlayer';

interface CodeProps {
  className?: string;
  children?: ReactNode;
}

const PreBlock: FC<ComponentPropsWithoutRef<'pre'>> = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);

  const child = Children.toArray(children)[0];
  if (!isValidElement(child) || child.type !== 'code') {
    return <pre {...props}>{children}</pre>;
  }

  const codeProps = child.props as CodeProps;
  const className = codeProps.className || '';
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : 'text';
  const code = String(codeProps.children).replace(/\n$/, '');

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyError) {
        console.error('Fallback copy failed', copyError);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="my-4 rounded-lg bg-gray-900 border border-gray-700 overflow-hidden">
      <div className="code-block-header">
        <span>{language}</span>
        <button onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre {...props} className="p-4 overflow-x-auto bg-transparent">
        {child}
      </pre>
    </div>
  );
};

const ParagraphRenderer: FC<{ children?: ReactNode }> = ({ children }) => {
    return <p className="mb-4 last:mb-0">{children}</p>;
};


const LinkRenderer: FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ href, children, ...rest }) => {
  if (href && href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        {...rest}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg no-underline transition-colors text-base my-4"
      >
        <Mail className="h-5 w-5" />
        <span>{children}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
      className="inline-flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded-lg text-blue-300 no-underline transition-colors text-sm"
    >
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4" />
    </a>
  );
};


const BlinkingCursor = () => <span className="animate-blink">▍</span>;

const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex items-start gap-4 justify-end">
    <div className="user-message-bubble whitespace-pre-wrap">
      {message.text}
    </div>
    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-blue-800">
      <User className="h-5 w-5" />
    </div>
  </div>
);

const AiMessage = ({ message }: { message: Message }) => {
  const [visibleUnitsCount, setVisibleUnitsCount] = useState(0);

  useEffect(() => {
    setVisibleUnitsCount(0);
  }, [message.id]);

  const wordUnits = useMemo(() => {
    const text = message.text || '';
    const segments = text.match(/\S+|\s+/g) || [];
    const units: string[] = [];
    for (let i = 0; i < segments.length; ) {
      const seg = segments[i];
      if (/\S/.test(seg)) {
        const next = segments[i + 1];
        const withSpace = next && /^\s+$/.test(next) ? seg + next : seg;
        units.push(withSpace);
        i += withSpace.length > seg.length ? 2 : 1;
      } else {
        units.push(seg);
        i += 1;
      }
    }
    return units;
  }, [message.text]);

  useEffect(() => {
    if (visibleUnitsCount >= wordUnits.length) return;

    const speedMs = 60;
    const timer = setTimeout(() => {
      setVisibleUnitsCount((prev) => Math.min(prev + 1, wordUnits.length));
    }, speedMs);

    return () => clearTimeout(timer);
  }, [visibleUnitsCount, wordUnits.length]);

  const displayText = useMemo(() => {
    if (wordUnits.length === 0) return '';
    return wordUnits.slice(0, visibleUnitsCount).join('');
  }, [wordUnits, visibleUnitsCount]);

  const shouldShowCursor = message.isStreaming || visibleUnitsCount < wordUnits.length;

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border border-white/10 bg-gray-800">
        <Bot className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex-1 max-w-4xl pt-1">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: PreBlock,
              p: ParagraphRenderer,
              a: LinkRenderer,
            }}
          >
            {displayText}
          </ReactMarkdown>
          {shouldShowCursor && <BlinkingCursor />}
        </div>
        {message.audioUrl && !message.isStreaming && <AudioPlayer audioUrl={message.audioUrl} />}
      </div>
    </div>
  );
};

export const ChatMessage = ({ message }: { message: Message }) => {
  if (message.sender === 'user') {
    return <UserMessage message={message} />;
  }
  return <AiMessage message={message} />;
};