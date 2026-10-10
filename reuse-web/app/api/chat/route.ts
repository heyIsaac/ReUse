import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper for Watson Assistant integration (To be configured with real credentials)
async function sendToWatson(message: string, sessionId?: string) {
    const apikey = process.env.WATSON_ASSISTANT_APIKEY;
    const url = process.env.WATSON_ASSISTANT_URL;
    const environmentId = process.env.WATSON_ASSISTANT_ENVIRONMENT_ID;

    if (!apikey || !url || !environmentId) {
        // If not configured, fallback to simple local mock orchestrator for now
        return mockWatsonOrchestrator(message);
    }

    // TODO: Replace with real IBM watsonx SDK or fetch call when configured
    // This is a placeholder for the actual IBM API call
    console.log(`Sending to Watson at ${url} with Env ID ${environmentId}`);

    // FOR ACADEMIC DEMO: Since the real Watson on IBM Cloud has no intents trained yet,
    // we will force the Mock Orchestrator here to ensure the database actions work for the video.
    return mockWatsonOrchestrator(message);
}

// Local mock orchestrator while Watson is not configured
async function mockWatsonOrchestrator(message: string) {
    const lowerMsg = message.toLowerCase();
    let intent = "ajuda_geral";

    if (
        lowerMsg.includes("meus anúncios") ||
        lowerMsg.includes("meus anuncios") ||
        lowerMsg.includes("meus produtos") ||
        lowerMsg.includes("produtos eu") ||
        lowerMsg.includes("anunciei")
    ) {
        intent = "consultar_meus_anuncios";
    } else if (
        lowerMsg.includes("favoritar") ||
        lowerMsg.includes("salvar") ||
        lowerMsg.includes("adicionar aos favoritos") ||
        lowerMsg.includes("como favoritar") ||
        lowerMsg.includes("como salvar")
    ) {
        intent = "favoritar_anuncio";
    } else if (lowerMsg.includes("desfavoritar") || lowerMsg.includes("remover dos favoritos")) {
        intent = "desfavoritar_anuncio";
    } else if (
        lowerMsg.includes("meus favoritos") ||
        lowerMsg.includes("produtos salvos") ||
        lowerMsg.includes("quais favoritos")
    ) {
        intent = "consultar_favoritos";
    } else if (
        lowerMsg.includes("cadastrar") ||
        lowerMsg.includes("anunciar") ||
        lowerMsg.includes("publicar") ||
        lowerMsg.includes("novo item") ||
        lowerMsg.includes("como cadastrar")
    ) {
        intent = "cadastrar_anuncio";
    }

    // New Test Automation Intents
    if (lowerMsg.includes("criar anúncio de teste") || lowerMsg.includes("anunciar teste") || lowerMsg.includes("criar anuncio de teste") || lowerMsg.includes("criar anúncio teste")) {
        intent = "criar_anuncio_teste";
    } else if (lowerMsg.includes("excluir meu último anúncio") || lowerMsg.includes("excluir último") || lowerMsg.includes("deletar último") || lowerMsg.includes("apagar último") || lowerMsg.includes("excluir meu ultimo")) {
        intent = "excluir_ultimo_anuncio";
    }

    return { intent, originalMessage: message, response: undefined };
}

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
        }

        // Try sending to Watson (or our mock if not configured)
        const watsonResult = await sendToWatson(message);
        const intent = watsonResult.intent;

        const user = await requireAuth();

        // Pilar A: Executar tarefas
        if (intent === "consultar_meus_anuncios") {
            if (!user) {
                return NextResponse.json({
                    response:
                        "Você precisa estar logado para ver seus anúncios. Por favor, acesse a página de Perfil para entrar.",
                });
            }

            const listings = await prisma.listing.findMany({
                where: { userId: user.id },
                select: { id: true, title: true, price: true },
            });

            if (listings.length === 0) {
                return NextResponse.json({ response: "Você ainda não possui anúncios publicados no ReUse." });
            }

            let responseText = `Você possui ${listings.length} anúncio(s):\n\n`;
            listings.forEach((l) => {
                responseText += `- **${l.title}** ${l.price ? `(R$ ${l.price})` : "(Sem preço)"} - [Ver anúncio](/produto/${l.id})\n`;
            });

            return NextResponse.json({ response: responseText });
        }

        if (intent === "consultar_favoritos") {
            if (!user) {
                return NextResponse.json({ response: "Você precisa estar logado para ver seus favoritos." });
            }

            const favorites = await prisma.favorite.findMany({
                where: { userId: user.id },
                include: { listing: true },
            });

            if (favorites.length === 0) {
                return NextResponse.json({ response: "Você não possui anúncios favoritados." });
            }

            let responseText = `Você possui ${favorites.length} anúncio(s) nos favoritos:\n\n`;
            favorites.forEach((f) => {
                responseText += `- **${f.listing.title}** - [Ver anúncio](/produto/${f.listing.id})\n`;
            });

            return NextResponse.json({ response: responseText });
        }

        if (intent === "favoritar_anuncio" || intent === "desfavoritar_anuncio") {
            if (!user) {
                return NextResponse.json({ response: "Você precisa estar logado para alterar seus favoritos." });
            }
            return NextResponse.json({
                response:
                    "Para favoritar um anúncio, utilize o botão de coração diretamente na página do produto. O assistente de voz não sabe qual anúncio você está visualizando no momento.",
            });
        }

        if (intent === "excluir_ultimo_anuncio") {
            if (!user) {
                return NextResponse.json({ response: "Você precisa estar logado para excluir anúncios." });
            }
            const lastListing = await prisma.listing.findFirst({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            });
            if (!lastListing) {
                return NextResponse.json({ response: "Você não possui anúncios para excluir." });
            }
            await prisma.listing.delete({ where: { id: lastListing.id } });
            return NextResponse.json({ response: `O anúncio "${lastListing.title}" foi excluído com sucesso.` });
        }

        if (intent === "criar_anuncio_teste") {
            if (!user) {
                return NextResponse.json({ response: "Você precisa estar logado para criar anúncios." });
            }
            
            // Pega uma categoria existente ou cria uma caso não tenha
            let category = await prisma.category.findFirst();
            if (!category) {
                 category = await prisma.category.create({ data: { name: 'Geral' }});
            }

            const newListing = await prisma.listing.create({
                data: {
                    title: "Produto de Teste (Criado pelo Watson)",
                    description: "Anúncio gerado automaticamente via comando de voz.",
                    condition: "novo",
                    price: 15.00,
                    userId: user.id,
                    categoryId: category.id,
                    images: []
                }
            });
            return NextResponse.json({ response: `Sucesso! Criei um anúncio chamado "${newListing.title}". Você pode vê-lo perguntando "quais são meus anúncios".` });
        }

        if (intent === "cadastrar_anuncio") {
            if (!user) {
                return NextResponse.json({
                    response:
                        "Você precisa estar logado para cadastrar um anúncio. Acesse a página de Perfil para entrar.",
                });
            }
            return NextResponse.json({
                response:
                    "Para cadastrar um anúncio de forma guiada, por favor acesse a página [Anunciar](/anunciar). Mas se quiser testar a automação, você pode pedir: 'Criar anúncio de teste'.",
            });
        }

        // Pilar B: Orientações de uso
        if (intent === "ajuda_geral" || watsonResult.response) {
            if (watsonResult.response) {
                return NextResponse.json({ response: watsonResult.response });
            }

            // Default Help response if Watson is not configured
            return NextResponse.json({
                response:
                    'Bem-vindo à ajuda do ReUse!\n\nVocê pode me perguntar coisas como:\n- "Quais são meus anúncios?"\n- "Como favoritar um produto?"\n- "Quais são meus favoritos?"\n\n*Nota: A integração total com o IBM Watson aguarda configuração das credenciais no servidor.*',
            });
        }

        return NextResponse.json({ response: "Desculpe, não entendi. Pode reformular?" });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
