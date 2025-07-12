
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, DollarSign, Filter, MapPin, Clock, Shield, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Officer {
  id: string;
  badge_number: string;
  hourly_rate: number;
  rating: number;
  total_jobs: number;
  specializations: string[];
  status: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  companies: {
    company_name: string;
  };
}

interface OfficerSelectionProps {
  selectedService: string;
  userLocation: { lat: number; lng: number };
}

const OfficerSelection: React.FC<OfficerSelectionProps> = ({ selectedService, userLocation }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const { toast } = useToast();

  useEffect(() => {
    fetchOfficers();
  }, [selectedService]);

  useEffect(() => {
    filterAndSortOfficers();
  }, [officers, priceRange, minRating, sortBy]);

  const fetchOfficers = async () => {
    try {
      const { data: officersData, error } = await supabase
        .from('security_officers')
        .select(`
          *,
          profiles:user_id (first_name, last_name),
          companies:company_id (company_name)
        `)
        .eq('status', 'available')
        .not('hourly_rate', 'is', null);

      if (error) {
        console.error('Error fetching officers:', error);
        toast({
          title: "Error",
          description: "Failed to load officers. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setOfficers(officersData || []);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: "Error",
        description: "Failed to load officers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOfficers = () => {
    let filtered = officers.filter(officer => 
      officer.hourly_rate >= priceRange[0] && 
      officer.hourly_rate <= priceRange[1] &&
      officer.rating >= minRating
    );

    // Sort officers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.hourly_rate - b.hourly_rate;
        case 'price_high':
          return b.hourly_rate - a.hourly_rate;
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.total_jobs - a.total_jobs;
        default:
          return b.rating - a.rating;
      }
    });

    setFilteredOfficers(filtered);
  };

  const handleSelectOfficer = (officer: Officer) => {
    toast({
      title: "Officer Selected",
      description: `You have selected ${officer.profiles.first_name} ${officer.profiles.last_name} for $${officer.hourly_rate}/hour`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading officers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4 text-white" />
            <h3 className="text-white font-medium">Filter Officers</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Price Range */}
            <div>
              <label className="text-white text-sm mb-2 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-white text-sm mb-2 block">Minimum Rating</label>
              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-white text-sm mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-white text-sm">
                {filteredOfficers.length} officers found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Officers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOfficers.map((officer) => (
          <Card key={officer.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Officer Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      {officer.profiles.first_name} {officer.profiles.last_name}
                    </h4>
                    <p className="text-white/60 text-sm">{officer.companies.company_name}</p>
                    <p className="text-white/50 text-xs">Badge: {officer.badge_number}</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400">
                    Available
                  </Badge>
                </div>

                {/* Rating and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{officer.rating}</span>
                    <span className="text-white/60 text-sm">({officer.total_jobs} jobs)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-white font-medium">${officer.hourly_rate}/hr</span>
                  </div>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1">
                  {officer.specializations?.slice(0, 2).map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-white/30 text-white/80">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1 text-white/60">
                    <Clock className="h-3 w-3" />
                    <span>~{Math.floor(Math.random() * 15 + 5)} min</span>
                  </div>
                  <div className="flex items-center space-x-1 text-white/60">
                    <MapPin className="h-3 w-3" />
                    <span>{(Math.random() * 3 + 0.5).toFixed(1)} km</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => handleSelectOfficer(officer)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Select Officer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOfficers.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Officers Found</h3>
            <p className="text-white/60 text-sm">
              Try adjusting your filters to see more results
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfficerSelection;
