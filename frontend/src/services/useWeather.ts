import { useQuery } from '@tanstack/react-query';

/**
 * API Externa: OpenWeather
 * Fornece dados meteorológicos em tempo real
 * 
 * Documentação: https://openweathermap.org/api
 * API Key: Gratuita (1000 calls/dia)
 * Telas que usam: Home (widget), Chat (sugestão de entrega)
 * 
 * IMPORTANTE: Criar conta em https://openweathermap.org/api
 * e adicionar ao .env:
 * EXPO_PUBLIC_OPENWEATHER_API_KEY=sua_chave_aqui
 */

interface WeatherData {
  temp: number; // Temperatura em Celsius
  feels_like: number; // Sensação térmica
  humidity: number; // Umidade em %
  description: string; // "céu limpo", "chuva leve", etc
  icon: string; // Código do ícone (ex: "01d")
  wind_speed: number; // Velocidade do vento em m/s
  rain_probability?: number; // Probabilidade de chuva (0-100)
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || 'demo';

/**
 * Hook para buscar clima por coordenadas
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Dados do clima ou null
 * 
 * @example
 * const { data, isLoading } = useWeather(-23.5505, -46.6333); // São Paulo
 * if (data) {
 *   console.log(`${data.temp}°C - ${data.description}`);
 * }
 */
export function useWeather(lat: number | null, lon: number | null) {
  return useQuery<WeatherData | null>({
    queryKey: ['weather', lat, lon],
    queryFn: async () => {
      if (!lat || !lon) return null;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar clima');
      }

      const data: OpenWeatherResponse = await response.json();

      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
      };
    },
    enabled: !!lat && !!lon && API_KEY !== 'demo',
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos
    retry: 2,
  });
}

/**
 * Hook para buscar clima por cidade
 * 
 * @example
 * const { data } = useWeatherByCity('São Paulo');
 */
export function useWeatherByCity(city: string | null) {
  return useQuery<WeatherData | null>({
    queryKey: ['weather-city', city],
    queryFn: async () => {
      if (!city) return null;

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )},BR&appid=${API_KEY}&units=metric&lang=pt_br`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Cidade não encontrada');
      }

      const data: OpenWeatherResponse = await response.json();

      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
      };
    },
    enabled: !!city && API_KEY !== 'demo',
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Retorna URL do ícone do clima
 * @example getWeatherIcon('01d') // URL da imagem
 */
export function getWeatherIcon(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

/**
 * Verifica se o clima está bom para entrega
 * @returns true se clima favorável (sem chuva, temperatura amena)
 */
export function isGoodWeatherForDelivery(weather: WeatherData): boolean {
  const { temp, description } = weather;

  // Evitar chuva
  const hasBadWeather = description.toLowerCase().includes('chuva') || 
                        description.toLowerCase().includes('tempestade');

  // Temperatura confortável (15°C - 35°C)
  const isComfortableTemp = temp >= 15 && temp <= 35;

  return !hasBadWeather && isComfortableTemp;
}

/**
 * Retorna sugestão de mensagem baseada no clima
 */
export function getWeatherSuggestion(weather: WeatherData): string {
  if (isGoodWeatherForDelivery(weather)) {
    return `☀️ Clima favorável para combinar a entrega! ${weather.temp}°C e ${weather.description}.`;
  }

  if (weather.description.toLowerCase().includes('chuva')) {
    return `🌧️ Está previsto ${weather.description}. Que tal combinar para outro dia?`;
  }

  if (weather.temp > 35) {
    return `🔥 Muito calor (${weather.temp}°C)! Combine um horário mais fresco.`;
  }

  if (weather.temp < 15) {
    return `❄️ Está frio (${weather.temp}°C)! Lembre-se de se agasalhar para a entrega.`;
  }

  return `🌤️ ${weather.temp}°C e ${weather.description}`;
}
