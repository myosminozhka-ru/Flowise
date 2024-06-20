import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface';
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils';
import { YandexGPTEmbeddings } from '@langchain/yandex';

class YandexEmbedding_Embeddings implements INode {
    label: string;
    name: string;
    version: number;
    type: string;
    icon: string;
    category: string;
    description: string;
    baseClasses: string[];
    credential: INodeParams;
    inputs: INodeParams[];
    model: YandexGPTEmbeddings | null = null;  // Добавлено поле для хранения инстанса модели

    constructor() {
        this.label = 'Yandex Embeddings';
        this.name = 'yandexEmbeddings';
        this.version = 1.0;
        this.type = 'YandexEmbeddings';
        this.icon = 'yandex.svg';
        this.category = 'Embeddings';
        this.description = 'Yandex API для генерации эмбеддингов';
        this.baseClasses = [this.type, ...getBaseClasses(YandexGPTEmbeddings)];
        this.credential = {
            label: 'Подключить учетные данные',
            name: 'credential',
            type: 'credential',
            credentialNames: ['chatYandexGPT']
        };
        this.inputs = [
            {
                label: 'Тип модели',
                name: 'modelType',
                type: 'options',
                options: [
                    { label: 'Document Embedding', name: 'text-search-doc' },
                    { label: 'Query Embedding', name: 'text-search-query' }
                ],
                default: 'text-search-query'
            }
        ];
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        console.log("Инициализация Yandex Embeddings");
        const modelType = nodeData.inputs?.modelType as string || 'text-search-query';

        const credentialData = await getCredentialData(nodeData.credential ?? '', options);
        const yandexApiKey = getCredentialParam('chatYandexGptApiKey', credentialData, nodeData);
        const folderId = getCredentialParam('chatYandexGptFolderID', credentialData, nodeData);

        const modelUri = `emb://${folderId}/${modelType}/latest`;
        this.model = new YandexGPTEmbeddings({
            apiKey: yandexApiKey,
            folderID: folderId,
            modelURI: modelUri
        });

        console.log("Model URI:", modelUri);
        return this.model;
    }

    async embedQuery(text: string): Promise<any> {
        if (!this.model) {
            throw new Error('Модель не инициализирована');
        }
        return await this.model.embedQuery(text);
    }
    
    async embedDocuments(documents: string[]): Promise<any> {
        if (!this.model) {
            throw new Error('Модель не инициализирована');
        }
        return await this.model.embedDocuments(documents);
    }
}

module.exports = { nodeClass: YandexEmbedding_Embeddings };
