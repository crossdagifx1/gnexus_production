import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ConversationSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: { status: string; dateRange: string }) => void;
  activeFilters: { status: string; dateRange: string };
}

export const ConversationSearch = ({
  onSearch,
  onFilterChange,
  activeFilters,
}: ConversationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    onFilterChange({ status: 'all', dateRange: 'all' });
  };

  const hasActiveFilters = activeFilters.status !== 'all' || activeFilters.dateRange !== 'all';

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by session ID, email, or content..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {(activeFilters.status !== 'all' ? 1 : 0) + (activeFilters.dateRange !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={activeFilters.status}
                  onValueChange={(value) => onFilterChange({ ...activeFilters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select
                  value={activeFilters.dateRange}
                  onValueChange={(value) => onFilterChange({ ...activeFilters, dateRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Badges */}
        {activeFilters.status !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {activeFilters.status}
            <button onClick={() => onFilterChange({ ...activeFilters, status: 'all' })}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {activeFilters.dateRange !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {activeFilters.dateRange === 'today' ? 'Today' : 
             activeFilters.dateRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
            <button onClick={() => onFilterChange({ ...activeFilters, dateRange: 'all' })}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
      </div>
    </div>
  );
};
