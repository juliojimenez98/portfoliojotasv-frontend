import type { Metadata } from 'next';
import { auth } from '@/auth';
import { CariocaApp } from '@/modules/carioca';

export const metadata: Metadata = {
  title: 'Anotador de Carioca | JotasVApp',
  description:
    'Anotador interactivo de puntos para el juego de cartas chileno Carioca. Rondas configurables, cálculo automático, ranking en tiempo real y podio.',
};

export default async function CariocaPage() {
  const session = await auth();
  const userEmail = session?.user?.email || null;

  return <CariocaApp userEmail={userEmail} />;
}
