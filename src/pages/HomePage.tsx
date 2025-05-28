import Hero from '../components/ui/Hero';
import CategorySection from '../components/ui/CategorySection';
import FeaturedProducts from '../components/ui/FeaturedProducts';
import SpecialOffers from '../components/ui/SpecialOffers';
import HowItWorks from '../components/ui/HowItWorks';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategorySection />
      <FeaturedProducts />
      <SpecialOffers />
      
      <div className="section-container flex justify-center">
        <Link to="/cardapio" className="btn-primary">
          Ver Cardápio Completo
        </Link>
      </div>

      <HowItWorks />
    </div>
  );
}