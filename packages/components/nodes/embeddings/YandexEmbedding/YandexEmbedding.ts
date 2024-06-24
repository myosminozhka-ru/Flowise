import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface';
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
                default: 'text-search-doc'
            }
        ];
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const modelType = nodeData.inputs?.modelType as string;

        if (nodeData.inputs?.credentialId) {
            nodeData.credential = nodeData.inputs?.credentialId;
        }
        const credentialData = await getCredentialData(nodeData.credential ?? '', options);
        if (!credentialData) {
            throw new Error('Credential data not found');
        }

        const yandexApiKey = getCredentialParam('chatYandexGptApiKey', credentialData, nodeData);
        const folderId = getCredentialParam('chatYandexGptFolderID', credentialData, nodeData);
        if (!yandexApiKey || !folderId) {
            throw new Error('Yandex API Key or Folder ID not found');
        }

        console.log('Yandex API Key:', yandexApiKey);
        console.log('Folder ID:', folderId);

        const modelUri = `emb://${folderId}/${modelType}/latest`;
        console.log('Model URI:', modelUri);

        const model = new YandexGPTEmbeddings({
            apiKey: yandexApiKey,
            folderID: folderId,
            modelURI: modelUri
        });

        // Проверка работоспособности модели
        const testText = "Hello, world!";
        try {
            const embedding = await model.embed([testText]);
            console.log('Embedding for test text:', embedding);
        } catch (error) {
            console.error('Error generating embedding:', error);
        }

        return model;
    }
}

module.exports = { nodeClass: YandexEmbedding_Embeddings };
