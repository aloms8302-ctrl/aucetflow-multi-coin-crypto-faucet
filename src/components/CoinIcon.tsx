import React from 'react';
import { CoinType } from '../types/faucet';

interface CoinIconProps {
  coin: CoinType;
  className?: string;
  size?: number;
}

export const CoinIcon: React.FC<CoinIconProps> = ({ coin, className = '', size = 28 }) => {
  switch (coin) {
    case 'BTC':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M22.5 13.8c.3-1.8-.8-2.8-2.6-3.4l.6-2.3-1.4-.3-.5 2.2c-.4-.1-.8-.2-1.2-.3l.5-2.2-1.4-.4-.5 2.3c-.3-.1-.6-.2-.9-.2l-2-.5-.4 1.6s1.1.2 1 .3c.6.2.7.5.7.8l-.7 2.9c0 .1.1.1.1.2l-.1 0-.9 3.8c-.1.2-.3.4-.7.3 0 0-1-.3-1-.3l-.7 1.8 1.9.5c.3.1.7.2 1 .3l-.5 2.3 1.4.3.5-2.3c.4.1.8.2 1.2.3l-.5 2.3 1.4.3.5-2.3c2.4.5 4.2.3 5-1.9.6-1.8 0-2.8-1.3-3.5 1-.2 1.7-1 1.9-2.3zm-3.4 5.3c-.4 1.8-3.3.8-4.2.6l.8-3.1c.9.2 3.8.7 3.4 2.5zm.4-4.7c-.4 1.6-2.9.8-3.6.6l.7-2.8c.8.2 3.3.6 2.9 2.2z"
            fill="white"
          />
        </svg>
      );
    case 'LTC':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="16" cy="16" r="16" fill="#345D9D" />
          <path
            d="M13.8 22.8h8.4l.6-2.7h-5.4l2.1-8.5h-3.4l-1.3 5.4-1.9.7.5-2.2-1.5.5-.5 2.2-2.1.8-.5 2 2.1-.8-1.5 5.8 2.1-.8.9-3.2 2-.7-2 8.4z"
            fill="white"
          />
        </svg>
      );
    case 'DOGE':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="16" cy="16" r="16" fill="#C2A633" />
          <path
            d="M11 9h5.6c4.6 0 7.4 2.8 7.4 7s-2.8 7-7.4 7H11V9zm3.5 3v8h2.1c2.6 0 4.2-1.6 4.2-4s-1.6-4-4.2-4h-2.1zm-4 4.5h10.5v1.6H10.5v-1.6z"
            fill="white"
          />
        </svg>
      );
    case 'USDT':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            d="M17.5 16.5c-.1 0-.7.1-1.5.1s-1.4-.1-1.5-.1c-3.7-.2-6.5-1-6.5-2s2.8-1.8 6.5-2c.1 0 .7-.1 1.5-.1s1.4.1 1.5.1c3.7.2 6.5 1 6.5 2s-2.8 1.8-6.5 2zm0-4.6v-3h4.6V6.5H9.9v2.4h4.6v3c-4.2.2-7.4 1.2-7.4 2.4s3.2 2.2 7.4 2.4v8.8h3v-8.8c4.2-.2 7.4-1.2 7.4-2.4s-3.2-2.2-7.4-2.4z"
            fill="white"
          />
        </svg>
      );
  }
};
