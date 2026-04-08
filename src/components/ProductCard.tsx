import { Product } from '@/lib/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  index: number;
}

const ProductCard = ({ product, onClick, index }: ProductCardProps) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg animate-bounce-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => onClick(product)}
    >
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
        <h3 className="text-lg font-semibold">{product.name}</h3>
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
