import { Product } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  index: number;
  isBestSeller?: boolean;
}

const ProductCard = ({ product, onClick, index, isBestSeller }: ProductCardProps) => {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-shadow hover:shadow-lg animate-bounce-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onClick(product)}
    >
      {isBestSeller && (
        <div className={cn(
          'absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg',
          'bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-fade-in'
        )}>
          <Flame className="h-3 w-3" />
          ขายดี
        </div>
      )}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={512}
          height={512}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="flex flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">฿{product.price}</span>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onClick(product); }}>
            สั่งซื้อ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
