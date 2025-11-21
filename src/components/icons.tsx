import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={32}
      height={32}
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Z"
      />
      <path
        fill="currentColor"
        d="M168 92h-28v-4a28 28 0 0 0-56 0v4H56a4 4 0 0 0-4 4v72a4 4 0 0 0 4 4h112a4 4 0 0 0 4-4V96a4 4 0 0 0-4-4Zm-84-4a20 20 0 0 1 40 0v4H84ZM160 164H60V100h100Z"
      />
    </svg>
  );
}
