import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter as useExpoRouter } from 'expo-router';
import { Camera, ChevronLeft, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import * as z from 'zod';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useCreateListing } from '@/src/services/useListings';

// 1. O CONTRATO (Zod Schema)
const donateSchema = z.object({
  images: z.array(z.string()).min(1, "Adicione pelo menos 1 foto").max(5, "Máximo de 5 fotos"),
  title: z.string().min(5, "O título precisa ter pelo menos 5 letras"),
  category: z.string().min(1, "Escolha uma categoria"),
  condition: z.string().min(1, "Qual é a condição do item?"),
  description: z.string().min(10, "Conte um pouco mais sobre o item (mín. 10 letras)"),
});

type DonateFormData = z.infer<typeof donateSchema>;

const CATEGORIES = ['Roupas', 'Calçados', 'Eletrônicos', 'Móveis', 'Livros'];
const CONDITIONS = ['Novo', 'Seminovo', 'Com marcas de uso'];

// Mapeamento de quais campos validar em qual passo
const STEP_FIELDS: (keyof DonateFormData)[][] = [
  ['images'],                 // Passo 0
  ['title', 'category'],      // Passo 1
  ['condition', 'description']// Passo 2
];

export default function CreateListing() {
  const router = useExpoRouter();
  const createListing = useCreateListing();

  // Controle do Wizard
  const [currentStep, setCurrentStep] = useState(0);
  const TOTAL_STEPS = 3;

  const { control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<DonateFormData>({
    resolver: zodResolver(donateSchema),
    defaultValues: { images: [], title: '', category: '', condition: '', description: '' },
  });

  const selectedImages = watch('images');

  // --- FUNÇÕES DE IMAGEM ---
  const pickImage = async () => {
    if (selectedImages.length >= 5) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.4,
    });

    if (!result.canceled) {
      setValue('images', [...selectedImages, result.assets[0].uri], { shouldValidate: true });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
    setValue('images', newImages, { shouldValidate: true });
  };

  // --- NAVEGAÇÃO DO WIZARD ---
  const handleNext = async () => {
    // 1. Descobre quais campos pertencem ao passo atual
    const fieldsToValidate = STEP_FIELDS[currentStep];

    // 2. Manda o React Hook Form validar SÓ esses campos
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      if (currentStep < TOTAL_STEPS - 1) {
        // Se estiver tudo ok e não for o último passo, avança a tela
        setCurrentStep(prev => prev + 1);
      } else {
        // Se for o último passo, submete o formulário inteiro
        handleSubmit(onSubmit)();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: DonateFormData) => {
    try {
      await createListing.mutateAsync(data);
      alert("Desapego publicado com sucesso! 🎉");
      router.push('/(tabs)');
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao publicar item. Tente novamente.");
    }
  };

  // --- RENDERIZADOR DE TELAS ANIMADAS ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1 mt-4">
            <Text variant="h2" className="text-[#642714] border-none pb-0 mb-2">Vamos começar com as fotos</Text>
            <Text className="text-[#8C6D62] text-base mb-8">Boas fotos ajudam o seu item a encontrar uma nova casa mais rápido. (Máx. 5)</Text>

            <View className="flex-row flex-wrap justify-between gap-y-4">
              {selectedImages.length < 5 && (
                <TouchableOpacity
                  activeOpacity={0.7} onPress={pickImage}
                  className="w-[48%] aspect-[4/5] bg-white border-2 border-dashed border-[#FF692E]/40 rounded-3xl items-center justify-center shadow-sm"
                >
                  <View className="bg-[#FF692E]/10 p-4 rounded-full mb-3">
                    <Camera color="#FF692E" size={32} />
                  </View>
                  <Text className="text-[#FF692E] font-bold">Adicionar Foto</Text>
                </TouchableOpacity>
              )}

              {selectedImages.map((uri, index) => (
                <View key={index} className="relative w-[48%] aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 shadow-sm">
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity
                    activeOpacity={0.8} onPress={() => removeImage(index)}
                    className="absolute top-3 right-3 bg-black/50 p-2 rounded-full backdrop-blur-md"
                  >
                    <X color="#FFFFFF" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {errors.images && (
              <Animated.Text entering={FadeIn} className="text-red-500 font-bold mt-4 bg-red-50 p-3 rounded-xl">
                ⚠️ {errors.images.message}
              </Animated.Text>
            )}
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1 mt-4">
            <Text variant="h2" className="text-[#642714] border-none pb-0 mb-2">O que você está desapegando?</Text>
            <Text className="text-[#8C6D62] text-base mb-8">Dê um título claro e ajude as pessoas a encontrarem seu item.</Text>

            <View className="mb-8">
              <Text className="text-[#642714] font-bold mb-3 uppercase tracking-wider text-xs">Título do anúncio</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Ex: Cadeira Eames Branca"
                    value={value}
                    onChangeText={onChange}
                    className={`bg-white h-16 pl-5 rounded-2xl border-2 shadow-sm ${errors.title ? 'border-red-400' : 'border-transparent focus:border-[#FF692E]'}`}
                  />
                )}
              />
              {errors.title && <Text className="text-red-500 text-xs mt-2 ml-1">{errors.title.message}</Text>}
            </View>

            <View className="mb-6">
              <Text className="text-[#642714] font-bold mb-3 uppercase tracking-wider text-xs">Categoria</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat} activeOpacity={0.7} onPress={() => onChange(cat)}
                        className={`px-5 py-3.5 rounded-2xl border-2 ${value === cat ? 'bg-[#FF692E] border-[#FF692E] shadow-md shadow-[#FF692E]/20' : 'bg-white border-zinc-100'}`}
                      >
                        <Text className={`font-bold ${value === cat ? 'text-white' : 'text-[#8C6D62]'}`}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.category && <Text className="text-red-500 text-xs mt-2 ml-1">{errors.category.message}</Text>}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1 mt-4">
            <Text variant="h2" className="text-[#642714] border-none pb-0 mb-2">Últimos detalhes</Text>
            <Text className="text-[#8C6D62] text-base mb-8">Conte a história desse item para o seu futuro dono.</Text>

            <View className="mb-8">
              <Text className="text-[#642714] font-bold mb-3 uppercase tracking-wider text-xs">Condição</Text>
              <Controller
                control={control}
                name="condition"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-3">
                    {CONDITIONS.map((cond) => (
                      <TouchableOpacity
                        key={cond} activeOpacity={0.7} onPress={() => onChange(cond)}
                        className={`px-5 py-3.5 rounded-2xl border-2 ${value === cond ? 'bg-[#84DCD9] border-[#84DCD9] shadow-md shadow-[#84DCD9]/30' : 'bg-white border-zinc-100'}`}
                      >
                        <Text className={`font-bold ${value === cond ? 'text-[#642714]' : 'text-[#8C6D62]'}`}>{cond}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.condition && <Text className="text-red-500 text-xs mt-2 ml-1">{errors.condition.message}</Text>}
            </View>

            <View className="mb-6">
              <Text className="text-[#642714] font-bold mb-3 uppercase tracking-wider text-xs">Descrição</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Tempo de uso, detalhes, defeitos (se houver)..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className={`bg-white h-40 pl-5 pt-5 rounded-3xl border-2 shadow-sm ${errors.description ? 'border-red-400' : 'border-transparent focus:border-[#FF692E]'}`}
                  />
                )}
              />
              {errors.description && <Text className="text-red-500 text-xs mt-2 ml-1">{errors.description.message}</Text>}
            </View>
          </Animated.View>
        );
    }
  };

  // Cálculo da barra de progresso animada
  const progressPercentage = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <ScreenLayout className="bg-[#FDF9F1] p-0" applyBottomInset={false}>

      {/* CABEÇALHO COM BOTÃO VOLTAR/CANCELAR E PROGRESS BAR */}
      <View className="px-6 pt-6 pb-2 bg-[#FDF9F1] z-10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={currentStep === 0 ? () => router.back() : handlePrev}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <ChevronLeft color="#642714" size={24} />
          </TouchableOpacity>
          <Text className="text-[#8C6D62] font-bold text-sm uppercase tracking-widest">
            Passo {currentStep + 1} de {TOTAL_STEPS}
          </Text>
          <View className="w-10" />
        </View>

        <View className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-[#FF692E] rounded-full"
            style={{ width: `${progressPercentage}%`, transitionProperty: 'width', transitionDuration: '300ms' }}
          />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}>
          {/* RENDERIZA APENAS O PASSO ATUAL */}
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* RODAPÉ STICKY COM BOTÕES DE AÇÃO */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-zinc-100 flex-row justify-between items-center" style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 24 }}>
        <Button
          variant="ghost"
          onPress={currentStep === 0 ? () => router.back() : handlePrev}
          className="flex-1 mr-4 h-14"
        >
          <Text className="text-[#8C6D62] font-bold text-base">
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </Text>
        </Button>

        <Button
          onPress={handleNext}
          disabled={createListing.isPending}
          className="flex-2 w-2/3 h-14 bg-[#FF692E] rounded-2xl shadow-lg shadow-[#FF692E]/30"
        >
          {createListing.isPending ? (
            <Text className="text-white font-bold text-lg">Processando...</Text>
          ) : (
            <Text className="text-white font-bold text-lg">
              {currentStep === TOTAL_STEPS - 1 ? 'Publicar' : 'Próximo'}
            </Text>
          )}
        </Button>
      </View>

    </ScreenLayout>
  );
}
