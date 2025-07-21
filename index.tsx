import dynamic from 'next/dynamic';
const RacingEngine = dynamic(() => import('../components/RacingEngine'), { ssr: false });
export default function Home() {
  return <RacingEngine />;
}