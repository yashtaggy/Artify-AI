import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M168,88a40,40,0,1,0-40,40,40,40,0,0,0,40-40m-56,80a8,8,0,0,0,8,8h24a8,8,0,0,0,0-16H120a8,8,0,0,0-8,8m101.4-82.93a8,8,0,0,0-11.31,0l-16,16A8,8,0,0,0,192,96h32a8,8,0,0,0,5.66-13.66ZM200,128H32a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H45.24a56,56,0,0,1,109.52,0H200a8,8,0,0,0,8-8V136a8,8,0,0,0-8-8"
      />
      <path
        fill="currentColor"
        d="M100,88a24,24,0,1,1,24-24,24,24,0,0,1-24,24"
        opacity={0.5}
      />
    </svg>
  );
}
