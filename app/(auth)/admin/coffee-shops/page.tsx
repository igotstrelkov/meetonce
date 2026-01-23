"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { ExternalLink, Plus, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
}

export default function CoffeeShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Id<"coffeeShops"> | null>(
    null
  );

  const coffeeShops = useQuery(api.coffeeShops.getAllCoffeeShops, {
    activeOnly: true,
  });
  const searchCoffeeShops = useAction(api.coffeeShops.searchCoffeeShops);
  const addCoffeeShop = useMutation(api.coffeeShops.addCoffeeShop);
  const deleteCoffeeShop = useMutation(api.coffeeShops.deleteCoffeeShop);

  const savedPlaceIds = new Set(coffeeShops?.map((s) => s.placeId) ?? []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchCoffeeShops({ query: searchQuery });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAdd = async (place: SearchResult) => {
    setIsAdding(place.placeId);
    try {
      await addCoffeeShop({
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        rating: place.rating,
        userRatingsTotal: place.userRatingsTotal,
        priceLevel: place.priceLevel,
      });
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCoffeeShop({ coffeeShopId: deleteTarget });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const getDirectionsUrl = (place: { placeId: string; address: string }) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}&destination_place_id=${place.placeId}`;
  };

  // const renderPriceLevel = (level?: number) => {
  //   if (level === undefined) return null;
  //   return "€".repeat(level + 1);
  // };

  if (coffeeShops === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Coffee Shops</h2>
        <p className="text-gray-600">
          Manage venue database for date suggestions in Dublin
        </p>
      </div>

      {/* Search Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Coffee Shops</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for coffee shops in Dublin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-600">
              Search Results ({searchResults.length})
            </h4>
            {searchResults.map((place) => {
              const isAlreadySaved = savedPlaceIds.has(place.placeId);
              const isAddingThis = isAdding === place.placeId;

              return (
                <div
                  key={place.placeId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{place.name}</span>
                      {place.rating && (
                        <Badge variant="secondary" className="shrink-0">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {place.rating.toFixed(1)}
                        </Badge>
                      )}
                      {/* {place.priceLevel !== undefined && (
                        <Badge variant="outline" className="shrink-0">
                          {renderPriceLevel(place.priceLevel)}
                        </Badge>
                      )} */}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {place.address}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isAlreadySaved ? "secondary" : "default"}
                    disabled={isAlreadySaved || isAddingThis}
                    onClick={() => handleAdd(place)}
                    className="ml-4 shrink-0"
                  >
                    {isAlreadySaved ? (
                      "Added"
                    ) : isAddingThis ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* {searchResults.length === 0 && searchQuery && !isSearching && (
          <p className="mt-4 text-sm text-gray-500">
            No results found. Try a different search term.
          </p>
        )} */}
      </Card>

      {/* Saved Coffee Shops */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Saved Coffee Shops ({coffeeShops.length})
        </h3>

        {coffeeShops.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No coffee shops saved yet. Search and add some above.
          </p>
        ) : (
          <div className="space-y-3">
            {coffeeShops.map((shop) => (
              <div
                key={shop._id}
                className="flex items-center justify-between p-4 border rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{shop.name}</span>
                    {shop.rating && (
                      <Badge variant="secondary" className="shrink-0">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {shop.rating.toFixed(1)}
                      </Badge>
                    )}
                    {/* {shop.priceLevel !== undefined && (
                      <Badge variant="outline" className="shrink-0">
                        {renderPriceLevel(shop.priceLevel)}
                      </Badge>
                    )} */}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 truncate">
                      {shop.address}
                    </p>
                    <ExternalLink
                      className="h-3 w-3 ml-1 hover:text-gray-600"
                      onClick={() =>
                        window.open(
                          getDirectionsUrl({
                            placeId: shop.placeId,
                            address: shop.address,
                          }),
                          "_blank"
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        getDirectionsUrl({
                          placeId: shop.placeId,
                          address: shop.address,
                        }),
                        "_blank"
                      )
                    }
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Directions
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button> */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteTarget(shop._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coffee Shop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this coffee shop from your list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
