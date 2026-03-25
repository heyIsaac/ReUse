import { Input } from "@/components/ui/input";
import { Search } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export function SearchBar() {
  return (
    <View className="mb-6">
      <View className="relative flex-row items-center bg-white rounded-2xl h-14 w-full">
        {/* Ícone posicionado absolutamente sobre o Input */}
        <View className="absolute right-4 z-10">
          <Search color="#8C6D62" size={20} />
        </View>

        {/* Input Semântico */}
        <Input placeholder="O que vamos reusar hoje?" />
      </View>
    </View>
  );
}
