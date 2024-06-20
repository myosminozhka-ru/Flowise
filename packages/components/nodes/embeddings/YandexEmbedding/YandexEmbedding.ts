// import { ICommonObject, INode, INodeData, INodeOptionsValue, INodeParams } from '../../../src/Interface';
// import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils';
// import { YandexGPTEmbeddings } from '@langchain/yandex';

// class YandexEmbedding_Embeddings implements INode {
//     label: string;
//     name: string;
//     version: number;
//     type: string;
//     icon: string;
//     category: string;
//     description: string;
//     baseClasses: string[];
//     credential: INodeParams;
//     inputs: INodeParams[];

//     constructor() {
//         this.label = 'Yandex Embeddings';
//         this.name = 'yandexEmbeddings';
//         this.version = 1.0;
//         this.type = 'YandexEmbeddings';
//         this.icon = 'yandex.svg';
//         this.category = 'Embeddings';
//         this.description = 'Yandex API для генерации эмбеддингов';
//         this.baseClasses = [this.type, ...getBaseClasses(YandexGPTEmbeddings)];
//         this.credential = {
//             label: 'Подключить учетные данные',
//             name: 'credential',
//             type: 'credential',
//             credentialNames: ['chatYandexGPT']
//         };
//         this.inputs = [
//             {
//                 label: 'Тип модели',
//                 name: 'modelType',
//                 type: 'options',
//                 options: [
//                     { label: 'Document Embedding', name: 'text-search-doc' },
//                     { label: 'Query Embedding', name: 'text-search-query' }
//                 ],
//                 default: 'text-search-doc'
//             },
//             {
//                 label: 'Текст',
//                 name: 'text',
//                 type: 'string'
//             }
//         ];
//     }

//     //@ts-ignore
//     loadMethods = {
//         async listModels(): Promise<INodeOptionsValue[]> {
//             return [
//                 { label: 'Document Embedding', name: 'text-search-doc' },
//                 { label: 'Query Embedding', name: 'text-search-query' }
//             ];
//         }
//     };

//     async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
//         console.log("Инициализация Yandex Embeddings");
//         const modelType = nodeData.inputs?.modelType as string;
//         const text = nodeData.inputs?.text as string;

//         if (!text) {
//             throw new Error("Текст не предоставлен");
//         }

//         if (nodeData.inputs?.credentialId) {
//             nodeData.credential = nodeData.inputs?.credentialId;
//         }
//         const credentialData = await getCredentialData(nodeData.credential ?? '', options);
        
//         const yandexApiKey = getCredentialParam('chatYandexGptApiKey', credentialData, nodeData);
//         const folderId = getCredentialParam('chatYandexGptFolderID', credentialData, nodeData);

//         const modelUri = `emb://${folderId}/${modelType}/latest`;

//         const model = new YandexGPTEmbeddings({
//             apiKey: yandexApiKey,
//             folderID: folderId,
//             modelURI: modelUri
//         });

//         let embedding;
//         if (modelType === 'text-search-doc') {
//             embedding = await model.embedDocuments([text]);
//         } else {
//             embedding = await model.embedQuery(text);
//         }

//         console.log("Embedding:", embedding);
//         return embedding;
//     }
// }

// module.exports = { nodeClass: YandexEmbedding_Embeddings };

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

    //@ts-ignore
    loadMethods = {
        async listModels(): Promise<INodeOptionsValue[]> {
            return [
                { label: 'Document Embedding', name: 'text-search-doc' },
                { label: 'Query Embedding', name: 'text-search-query' }
            ];
        }
    };

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        console.log("Инициализация Yandex Embeddings");
        const modelType = nodeData.inputs?.modelType as string;

        if (nodeData.inputs?.credentialId) {
            nodeData.credential = nodeData.inputs?.credentialId;
        }
        const credentialData = await getCredentialData(nodeData.credential ?? '', options);

        const yandexApiKey = getCredentialParam('chatYandexGptApiKey', credentialData, nodeData);
        const folderId = getCredentialParam('chatYandexGptFolderID', credentialData, nodeData);

        const modelUri = `emb://${folderId}/${modelType}/latest`;

        const model = new YandexGPTEmbeddings({
            apiKey: yandexApiKey,
            folderID: folderId,
            modelURI: modelUri
        });

        console.log("Model URI:", modelUri);
        return model;
    }
}

module.exports = { nodeClass: YandexEmbedding_Embeddings };