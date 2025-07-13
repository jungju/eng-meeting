// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';   // ← 추가

const dev = process.env.NODE_ENV === 'development';

export default {
  // ★ 가장 위 레벨에 preprocess 등록
  preprocess: preprocess({
    pug: true,        // pug 활성화
    typescript: true  // TS 이미 쓰고 있으니 같이 켜 두기
  }),

  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),
    paths: {
      base: ''
    }
  }
};
