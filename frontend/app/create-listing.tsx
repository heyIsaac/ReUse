import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter as useExpoRouter } from 'expo-router';
import { Camera, ChevronLeft, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import * as z from 'zod';

import { ScreenLayout } from '@/components/layout/screen-layout';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useCreateListing } from '@/src/services/useListings';
import { uploadImagesToCloudinary } from '@/src/services/cloudinaryUpload';

// ─────────────────────────────────────────────
// 1. SCHEMA
// ─────────────────────────────────────────────
const donateSchema = z.object({
  images: z
    .array(z.string())
    .min(1, 'Adicione pelo menos 1 foto')
    .max(5, 'Máximo de 5 fotos'),
  title: z.string().min(5, 'O título precisa ter pelo menos 5 caracteres'),
  category: z.string().min(1, 'Escolha uma categoria'),
  condition: z.string().min(1, 'Informe o estado do item'),
  description: z
    .string()
    .min(10, 'Descreva um pouco mais o item (mín. 10 caracteres)'),
});

type DonateFormData = z.infer<typeof donateSchema>;

// ─────────────────────────────────────────────
// 2. CONSTANTES
// ─────────────────────────────────────────────
const CATEGORIES = ['Roupas', 'Calçados', 'Eletrônicos', 'Móveis', 'Livros'];
const CONDITIONS = ['Novo', 'Seminovo', 'Com marcas de uso'];
const TOTAL_STEPS = 3;

// Campos que pertencem a cada passo
const STEP_FIELDS: (keyof DonateFormData)[][] = [
  ['images'],
  ['title', 'category'],
  ['condition', 'description'],
];

// Conteúdo editorial de cada passo (UX Writing)
const STEP_COPY = [
  {
    step: '01',
    title: 'Mostre\nseu item',
    subtitle:
      'Fotos nítidas geram muito mais interesse. Adicione até 5 imagens.',
  },
  {
    step: '02',
    title: 'O que você\nestá doando?',
    subtitle: 'Um título claro ajuda a pessoa certa a encontrar seu item.',
  },
  {
    step: '03',
    title: 'Conte mais\nsobre ele',
    subtitle: 'Seja honesto sobre o estado. Isso cria confiança.',
  },
];

// ─────────────────────────────────────────────
// 3. COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function CreateListing() {
  const router = useExpoRouter();
  const createListing = useCreateListing();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const isSubmitting = uploadState !== 'idle';

  const progressWidth = useSharedValue(1 / TOTAL_STEPS);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const {
    control,
    trigger,
    getValues,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonateFormData>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      images: [],
      title: '',
      category: '',
      condition: '',
      description: '',
    },
  });

  const selectedImages = watch('images');
  const copy = STEP_COPY[currentStep];

  // ── Avança o passo com validação dos campos do passo atual ──
  const handleNext = async () => {
    const isValid = await trigger(STEP_FIELDS[currentStep]);
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
      progressWidth.value = withTiming((currentStep + 2) / TOTAL_STEPS, {
        duration: 400,
      });
    } else {
      handleSubmit(onSubmit)();
    }
  };

  // ── Volta ao passo anterior ──
  const handlePrev = () => {
    if (currentStep === 0) {
      router.back();
      return;
    }
    setDirection('back');
    setCurrentStep((s) => s - 1);
    progressWidth.value = withTiming(currentStep / TOTAL_STEPS, {
      duration: 400,
    });
  };

  // ── Adiciona imagem da galeria ──
  const pickImage = async () => {
    if (selectedImages.length >= 5) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.4,
    });
    if (!result.canceled) {
      setValue('images', [...selectedImages, result.assets[0].uri], {
        shouldValidate: true,
      });
    }
  };

  // ── Remove imagem pelo índice ──
  const removeImage = (idx: number) => {
    setValue(
      'images',
      selectedImages.filter((_, i) => i !== idx),
      { shouldValidate: true }
    );
  };

  // ── Submissão final ──
  const onSubmit = async (data: DonateFormData) => {
    try {
      // Phase 1: upload photos directly to Cloudinary
      setUploadState('uploading');
      const cloudinaryUrls = await uploadImagesToCloudinary(data.images);

      // Phase 2: save the listing with the final CDN URLs
      setUploadState('saving');
      await createListing.mutateAsync({ ...data, images: cloudinaryUrls });

      alert('Desapego publicado com sucesso! 🎉');
      reset();
      setCurrentStep(0);
      progressWidth.value = withTiming(1 / TOTAL_STEPS);
      router.push('/(tabs)');
    } catch (err) {
      console.error('[CreateListing] onSubmit error:', err);
      alert('Não foi possível publicar. Verifique sua conexão e tente novamente.');
    } finally {
      setUploadState('idle');
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <ScreenLayout className="bg-[#FDF9F1]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ── BARRA DE PROGRESSO ── */}
        <View className="h-1 bg-zinc-100 w-full">
          <Animated.View
            style={progressStyle}
            className="h-full bg-[#FF692E] rounded-full"
          />
        </View>

        {/* ── HEADER ── */}
        <View
          className="flex-row items-center justify-between py-4"
          style={{ paddingHorizontal: 24 }}
          accessibilityRole="header"
        >
          <TouchableOpacity
            onPress={handlePrev}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={
              currentStep === 0 ? 'Voltar para o início' : 'Voltar ao passo anterior'
            }
            accessibilityRole="button"
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-zinc-100"
          >
            <ChevronLeft color="#642714" size={22} />
          </TouchableOpacity>

          {/* Contador de passos */}
          <Text
            className="text-[#8C6D62] text-xs font-semibold tracking-widest uppercase"
            accessibilityLabel={`Passo ${currentStep + 1} de ${TOTAL_STEPS}`}
          >
            {currentStep + 1} / {TOTAL_STEPS}
          </Text>

          {/* Espaço reservado para simetria */}
          <View className="w-10" />
        </View>

        {/* ── CONTEÚDO ANIMADO POR PASSO ── */}
        <Animated.View
          key={currentStep}
          entering={
            direction === 'forward'
              ? SlideInRight.duration(320).springify()
              : FadeIn.duration(250)
          }
          exiting={SlideOutLeft.duration(200)}
          className="flex-1 -mx-6"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          >
            {/* ── TÍTULO EDITORIAL DO PASSO ── */}
            <View className="mt-2 mb-8">
              <Text
                className="text-[#642714] font-bold leading-tight mb-2"
                style={{ fontSize: 32, lineHeight: 38 }}
                accessibilityRole="header"
              >
                {copy.title}
              </Text>
              <Text className="text-[#8C6D62] text-sm leading-relaxed">
                {copy.subtitle}
              </Text>
            </View>

            {/* ══════════════════════════════════
                PASSO 1 — FOTOS
            ══════════════════════════════════ */}
            {currentStep === 0 && (
              <View>
                <View className="flex-row flex-wrap gap-3">
                  {/* Botão de adicionar foto */}
                  {selectedImages.length < 5 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={pickImage}
                      accessibilityLabel="Adicionar foto"
                      accessibilityRole="button"
                      accessibilityHint="Abre a galeria para selecionar uma imagem"
                      className="bg-white border-2 border-dashed border-[#FF692E]/40 rounded-2xl items-center justify-center "
                      style={{ width: '50%', aspectRatio: 4 / 5 }}
                    >
                        <Camera color="#FF692E" size={22} />
                      <Text className="text-[#FF692E] font-bold text-xs">
                        Adicionar
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Miniaturas das fotos */}
                  {selectedImages.map((uri, idx) => (
                    <View
                      key={uri}
                      className="relative rounded-2xl overflow-hidden bg-zinc-100 shadow-sm"
                      style={{ width: '30%', aspectRatio: 4 / 5 }}
                      accessibilityLabel={`Foto ${idx + 1} de ${selectedImages.length}`}
                    >
                      <Image
                        source={{ uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                        accessibilityIgnoresInvertColors
                      />
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => removeImage(idx)}
                        accessibilityLabel={`Remover foto ${idx + 1}`}
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
                      >
                        <X color="#fff" size={13} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Erro de foto */}
                {errors.images && (
                  <Animated.View entering={FadeIn.duration(200)} className="mt-3">
                    <Text className="text-red-500 text-xs font-semibold">
                      ⚠️ {errors.images.message}
                    </Text>
                  </Animated.View>
                )}

                {/* Dica contextual */}
                {selectedImages.length === 0 && (
                  <Animated.View
                    entering={FadeIn.delay(300).duration(400)}
                    className="mt-6 bg-[#FF692E]/5 rounded-2xl p-4 border border-[#FF692E]/10"
                  >
                    <Text className="text-[#8C6D62] text-xs leading-relaxed">
                      💡 <Text className="font-semibold text-[#642714]">Dica:</Text> Fotos com boa
                      iluminação natural aumentam as chances do item ser retirado.
                    </Text>
                  </Animated.View>
                )}

                {/* Contador de fotos */}
                {selectedImages.length > 0 && (
                  <Text className="text-[#8C6D62] text-xs mt-3">
                    {selectedImages.length} de 5 fotos adicionadas
                  </Text>
                )}
              </View>
            )}

            {/* ══════════════════════════════════
                PASSO 2 — TÍTULO E CATEGORIA
            ══════════════════════════════════ */}
            {currentStep === 1 && (
              <View>
                {/* Título */}
                <View className="mb-8">
                  <Text
                    className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3"
                    accessibilityRole="none"
                  >
                    Título
                  </Text>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Ex: Cadeira de escritório cinza"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="done"
                        maxLength={60}
                        accessibilityLabel="Título do item"
                        accessibilityHint="Descreva o item em poucas palavras"
                        className={`bg-white h-14 pl-5 rounded-2xl border-2 shadow-sm text-[#3D2214] ${
                          errors.title
                            ? 'border-red-400'
                            : 'border-transparent focus:border-[#FF692E]'
                        }`}
                      />
                    )}
                  />
                  {errors.title ? (
                    <Text className="text-red-500 text-xs mt-2">
                      {errors.title.message}
                    </Text>
                  ) : (
                    <Text className="text-[#B0978E] text-xs mt-2">
                      Seja específico: marca, cor e modelo ajudam bastante.
                    </Text>
                  )}
                </View>

                {/* Categoria */}
                <View>
                  <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
                    Categoria
                  </Text>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                      <View
                        className="flex-row flex-wrap gap-2"
                        accessibilityRole="radiogroup"
                        accessibilityLabel="Categoria do item"
                      >
                        {CATEGORIES.map((cat) => {
                          const isSelected = value === cat;
                          return (
                            <TouchableOpacity
                              key={cat}
                              activeOpacity={0.7}
                              onPress={() => onChange(cat)}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: isSelected }}
                              accessibilityLabel={cat}
                              className={`px-5 py-3 rounded-2xl border-2 ${
                                isSelected
                                  ? 'bg-[#FF692E] border-[#FF692E]'
                                  : 'bg-white border-zinc-100'
                              }`}
                            >
                              <Text
                                className={`font-semibold text-sm ${
                                  isSelected ? 'text-white' : 'text-[#8C6D62]'
                                }`}
                              >
                                {cat}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  />
                  {errors.category && (
                    <Text className="text-red-500 text-xs mt-2">
                      {errors.category.message}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* ══════════════════════════════════
                PASSO 3 — CONDIÇÃO E DESCRIÇÃO
            ══════════════════════════════════ */}
            {currentStep === 2 && (
              <View>
                {/* Estado do item */}
                <View className="mb-8">
                  <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
                    Estado do item
                  </Text>
                  <Controller
                    control={control}
                    name="condition"
                    render={({ field: { onChange, value } }) => (
                      <View
                        className="gap-3"
                        accessibilityRole="radiogroup"
                        accessibilityLabel="Estado de conservação"
                      >
                        {CONDITIONS.map((cond) => {
                          const isSelected = value === cond;
                          return (
                            <TouchableOpacity
                              key={cond}
                              activeOpacity={0.7}
                              onPress={() => onChange(cond)}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: isSelected }}
                              accessibilityLabel={cond}
                              className={`flex-row items-center px-5 rounded-2xl border-2 ${
                                isSelected
                                  ? 'bg-[#84DCD9]/15 border-[#84DCD9]'
                                  : 'bg-white border-zinc-100'
                              }`}
                              style={{ height: 56 }}
                            >
                              {/* Radio visual */}
                              <View
                                className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${
                                  isSelected ? 'border-[#84DCD9]' : 'border-zinc-300'
                                }`}
                              >
                                {isSelected && (
                                  <View className="w-2.5 h-2.5 rounded-full bg-[#84DCD9]" />
                                )}
                              </View>
                              <Text
                                className={`font-semibold text-sm ${
                                  isSelected ? 'text-[#642714]' : 'text-[#8C6D62]'
                                }`}
                              >
                                {cond}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  />
                  {errors.condition && (
                    <Text className="text-red-500 text-xs mt-2">
                      {errors.condition.message}
                    </Text>
                  )}
                </View>

                {/* Descrição */}
                <View>
                  <Text className="text-[#642714] text-xs font-bold uppercase tracking-widest mb-3">
                    Mais detalhes
                  </Text>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Tempo de uso, marcas, motivo do desapego..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={500}
                        accessibilityLabel="Descrição do item"
                        accessibilityHint="Descreva com detalhes o estado e histórico do item"
                        className={`bg-white pl-5 pt-4 rounded-2xl border-2 shadow-sm text-[#3D2214] ${
                          errors.description
                            ? 'border-red-400'
                            : 'border-transparent focus:border-[#FF692E]'
                        }`}
                        style={{ height: 140 }}
                      />
                    )}
                  />
                  {errors.description ? (
                    <Text className="text-red-500 text-xs mt-2">
                      {errors.description.message}
                    </Text>
                  ) : (
                    <Text className="text-[#B0978E] text-xs mt-2">
                      Quanto mais detalhes, menos perguntas você recebe.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* ── CTA FIXO NO RODAPÉ ── */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-[#FDF9F1]/95"
          style={{
            paddingHorizontal: 24,
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.06)',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel={isLastStep ? 'Publicar desapego' : 'Continuar'}
            accessibilityState={{ disabled: isSubmitting }}
            className="w-full h-14 bg-[#FF692E] rounded-2xl items-center justify-center"
            style={{
              shadowColor: '#FF692E',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-base">
              {uploadState === 'uploading'
                ? `Enviando fotos...`
                : uploadState === 'saving'
                ? 'Publicando...'
                : isLastStep
                ? 'Publicar desapego'
                : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
