import { Poppins } from 'next/font/google';

import { LiaSignatureSolid } from 'react-icons/lia';

import { cn } from '@documenso/ui/lib/utils';

const poppins = Poppins({ subsets: ['latin'], weight: ['600'] });

export const Logo = ({ ...props }) => {
  return (
    <div className={cn(poppins.className, 'flex space-x-2 text-2xl font-semibold')}>
      <h1>Emplying</h1>
      <LiaSignatureSolid {...props} />
    </div>
  );
};
