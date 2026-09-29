import React from 'react';
import {
  Utensils,
  Bus,
  Home,
  Zap,
  ShoppingBag,
  Film,
  GraduationCap,
  HeartPulse,
  Sparkles,
  MoreHorizontal,
  Gift,
  Briefcase,
  Clock,
  Award,
  Store,
  Trophy,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} size={size} />;
    case 'Bus':
      return <Bus className={className} size={size} />;
    case 'Home':
      return <Home className={className} size={size} />;
    case 'Zap':
      return <Zap className={className} size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} size={size} />;
    case 'Film':
      return <Film className={className} size={size} />;
    case 'GraduationCap':
      return <GraduationCap className={className} size={size} />;
    case 'HeartPulse':
      return <HeartPulse className={className} size={size} />;
    case 'Sparkles':
      return <Sparkles className={className} size={size} />;
    case 'Gift':
      return <Gift className={className} size={size} />;
    case 'Briefcase':
      return <Briefcase className={className} size={size} />;
    case 'Clock':
      return <Clock className={className} size={size} />;
    case 'Award':
      return <Award className={className} size={size} />;
    case 'Store':
      return <Store className={className} size={size} />;
    case 'Trophy':
      return <Trophy className={className} size={size} />;
    case 'TrendingUp':
      return <TrendingUp className={className} size={size} />;
    case 'ArrowDownLeft':
      return <ArrowDownLeft className={className} size={size} />;
    case 'ArrowUpRight':
      return <ArrowUpRight className={className} size={size} />;
    case 'Wallet':
      return <Wallet className={className} size={size} />;
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal className={className} size={size} />;
  }
};
