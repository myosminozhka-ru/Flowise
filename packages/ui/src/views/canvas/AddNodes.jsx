import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

// material-ui
import { useTheme } from '@mui/material/styles'
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    ClickAwayListener,
    Divider,
    InputAdornment,
    List,
    ListItemButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    OutlinedInput,
    Paper,
    Popper,
    Stack,
    Typography,
    Chip,
    Tab,
    Tabs
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import Transitions from '@/ui-component/extended/Transitions'
import { StyledFab } from '@/ui-component/button/StyledFab'

// icons
import { IconPlus, IconSearch, IconMinus, IconX } from '@tabler/icons-react'
import LlamaindexPNG from '@/assets/images/llamaindex.png'
import LangChainPNG from '@/assets/images/langchain.png'

// const
import { baseURL } from '@/store/constant'
import { SET_COMPONENT_NODES } from '@/store/actions'
import { translationObject } from '@/translate'
// ==============================|| ADD NODES||============================== //

const translationsNodes = {
    Agents: 'Агенты',
    Cache: 'Кэш',
    Chains: 'Цепочки',
    'Chat Models': 'Языковая модель для чатов',
    'Document Loaders': 'Работа с документами',
    Embeddings: 'Вложения',
    LLMs: 'Языковая модель для агентов',
    Memory: 'Типы памяти',
    'Output Parsers': 'Выходные парсеры',
    Prompts: 'Подсказки для модели',
    Retrievers: 'Ретриверы',
    'Text Splitters': 'Обработчики текста',
    Tools: 'Дополнительные инструменты',
    'Vector Stores': 'Векторные хранилища',
    Utilities: 'Утилиты',
    Moderation: 'Модерация',
    Engine: 'Двигатели',
    'Response Synthesizer': 'Синтезатор ответов'
}
const excludedNodesByLable = [
    'Airtable',
    'Apify Website Content Crawler',
    'Confluence',
    'VectorStore to Document',
    'AWS Bedrock',
    'Azure ChatOpenAi',
    'NIBittensorChat',
    'ChatAntrophic',
    'ChatGooglePaLM',
    'ChatGoogleVertexAI',
    'ChatLocalAI',
    'AWS Bedrock Embeddings',
    'Azure OpenAI Embeddings',
    'Google PaLM Embeddings',
    'Google VertexAI Embeddings',
    'LocalAI Embeddings',
    'AWS Bedrock',
    'Azure OpenAI',
    'NIBittersorLLM',
    'GooglePaLM',
    'GoogleVertexAI',
    'Motorheard Memory',
    'Upstash Redis-Backed Chat Memory',
    'BraveSearchAPI',
    'SerpAPI',
    'Milvus',
    'OpenSearch',
    'Pinecone',
    'Singlestore',
    'Supabase',
    'Vectara',
    'Weaviate'
]

function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const blacklistCategoriesForAgentCanvas = ['Agents', 'Memory', 'Record Manager']
const allowedAgentModel = {}

const AddNodes = ({ nodesData, node, isAgentCanvas }) => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()

    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    const [open, setOpen] = useState(false)
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [tabValue, setTabValue] = useState(0)

    const anchorRef = useRef(null)
    const prevOpen = useRef(open)
    const ps = useRef()

    // Temporary method to handle Deprecating Vector Store and New ones
    const categorizeVectorStores = (nodes, accordianCategories, isFilter) => {
        const obj = { ...nodes }
        const vsNodes = obj['Vector Stores'] ?? []
        const deprecatingNodes = []
        const newNodes = []
        for (const vsNode of vsNodes) {
            if (vsNode.badge === 'DEPRECATING') deprecatingNodes.push(vsNode)
            else newNodes.push(vsNode)
        }
        delete obj['Vector Stores']
        if (deprecatingNodes.length) {
            obj['Векторные хранилища;DEPRECATING'] = deprecatingNodes
            accordianCategories['Vector Stores;DEPRECATING'] = isFilter ? true : false
        }
        if (newNodes.length) {
            obj['Векторные хранилища;NEW'] = newNodes
            accordianCategories['Vector Stores;NEW'] = isFilter ? true : false
        }
        setNodes(obj)
    }

    const scrollTop = () => {
        const curr = ps.current
        if (curr) {
            curr.scrollTop = 0
        }
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        filterSearch(searchValue, newValue)
    }

    const getSearchedNodes = (value) => {
        if (isAgentCanvas) {
            const nodes = nodesData.filter((nd) => !blacklistCategoriesForAgentCanvas.includes(nd.category))
            const passed = nodes.filter((nd) => {
                const passesQuery = nd.name.toLowerCase().includes(value.toLowerCase())
                const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
                return passesQuery || passesCategory
            })
            return passed
        }
        const nodes = nodesData.filter((nd) => nd.category !== 'Multi Agents')
        const passed = nodes.filter((nd) => {
            const passesQuery = nd.name.toLowerCase().includes(value.toLowerCase())
            const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
            return passesQuery || passesCategory
        })
        return passed
    }

    const filterSearch = (value, newTabValue) => {
        setSearchValue(value)
        setTimeout(() => {
            if (value) {
                const returnData = getSearchedNodes(value)
                groupByCategory(returnData, newTabValue ?? tabValue, true)
                scrollTop()
            } else if (value === '') {
                groupByCategory(nodesData, newTabValue ?? tabValue)
                scrollTop()
            }
        }, 500)
    }

    const groupByTags = (nodes, newTabValue = 0) => {
        const langchainNodes = nodes.filter((nd) => !nd.tags)
        const llmaindexNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('LlamaIndex'))
        if (newTabValue === 0) {
            return langchainNodes
        } else {
            return llmaindexNodes
        }
    }

    const groupByCategory = (nodes, newTabValue, isFilter) => {
        if (isAgentCanvas) {
            const accordianCategories = {}
            const result = nodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                // Filter out blacklisted categories
                if (!blacklistCategoriesForAgentCanvas.includes(category)) {
                    // Filter out LlamaIndex nodes
                    const nodes = result[category].filter((nd) => !nd.tags || !nd.tags.includes('LlamaIndex'))
                    if (!nodes.length) continue

                    // Only allow specific models for specific categories
                    if (Object.keys(allowedAgentModel).includes(category)) {
                        const allowedModels = allowedAgentModel[category]
                        filteredResult[category] = nodes.filter((nd) => allowedModels.includes(nd.name))
                    } else {
                        filteredResult[category] = nodes
                    }
                }
            }
            setNodes(filteredResult)
            categorizeVectorStores(filteredResult, accordianCategories, isFilter)
            accordianCategories['Multi Agents'] = true
            setCategoryExpanded(accordianCategories)
        } else {
            const taggedNodes = groupByTags(nodes, newTabValue)
            const accordianCategories = {}
            const result = taggedNodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (category === 'Multi Agents') {
                    continue
                }
                filteredResult[category] = result[category]
            }
            setNodes(filteredResult)
            categorizeVectorStores(filteredResult, accordianCategories, isFilter)
            setCategoryExpanded(accordianCategories)
        }
    }

    const handleAccordionChange = (category) => (event, isExpanded) => {
        const accordianCategories = { ...categoryExpanded }
        accordianCategories[category] = isExpanded
        setCategoryExpanded(accordianCategories)
    }

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return
        }
        setOpen(false)
    }

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen)
    }

    const onDragStart = (event, node) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }

    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus()
        }

        prevOpen.current = open
    }, [open])

    useEffect(() => {
        if (node) setOpen(false)
    }, [node])

    useEffect(() => {
        if (nodesData) {
            groupByCategory(nodesData)
            dispatch({ type: SET_COMPONENT_NODES, componentNodes: nodesData })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesData, dispatch])

    return (
        <>
            <StyledFab
                sx={{ left: 20, top: 20 }}
                ref={anchorRef}
                size='small'
                aria-label='add'
                title='Добавить Узел'
                onClick={handleToggle}
                color='secondary'
            >
                {open ? <IconMinus /> : <IconPlus />}
            </StyledFab>
            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [-40, 14]
                            }
                        }
                    ]
                }}
                sx={{ zIndex: 1000 }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <Box sx={{ p: 2 }}>
                                        <Stack>
                                            <Typography variant='h4'>Узлы</Typography>
                                        </Stack>
                                        <OutlinedInput
                                            sx={{ width: '100%', pr: 2, pl: 2, my: 2 }}
                                            id='input-search-node'
                                            value={searchValue}
                                            onChange={(e) => filterSearch(e.target.value)}
                                            placeholder='Поиск Узлов'
                                            startAdornment={
                                                <InputAdornment position='start'>
                                                    <IconSearch stroke={1.5} size='1rem' color={theme.palette.grey[500]} />
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                <InputAdornment
                                                    position='end'
                                                    sx={{
                                                        cursor: 'pointer',
                                                        color: theme.palette.grey[500],
                                                        '&:hover': {
                                                            color: theme.palette.grey[900]
                                                        }
                                                    }}
                                                    title='Очистить поиск'
                                                >
                                                    <IconX
                                                        stroke={1.5}
                                                        size='1rem'
                                                        onClick={() => filterSearch('')}
                                                        style={{
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                </InputAdornment>
                                            }
                                            aria-describedby='search-helper-text'
                                            inputProps={{
                                                'aria-label': 'weight'
                                            }}
                                        />
                                        {!isAgentCanvas && (
                                            <Tabs
                                                sx={{ position: 'relative', minHeight: '50px', height: '50px' }}
                                                variant='fullWidth'
                                                value={tabValue}
                                                onChange={handleTabChange}
                                                aria-label='tabs'
                                            >
                                                {['LangChain', 'LlamaIndex'].map((item, index) => (
                                                    <Tab
                                                        icon={
                                                            <div
                                                                style={{
                                                                    borderRadius: '50%'
                                                                }}
                                                            >
                                                                <img
                                                                    style={{
                                                                        width: '25px',
                                                                        height: '25px',
                                                                        borderRadius: '50%',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    src={index === 0 ? LangChainPNG : LlamaindexPNG}
                                                                    alt={item}
                                                                />
                                                            </div>
                                                        }
                                                        iconPosition='start'
                                                        sx={{ minHeight: '50px', height: '50px' }}
                                                        key={index}
                                                        label={item}
                                                        {...a11yProps(index)}
                                                    ></Tab>
                                                ))}
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        borderRadius: 10,
                                                        background: 'rgb(254,252,191)',
                                                        paddingLeft: 6,
                                                        paddingRight: 6,
                                                        paddingTop: 1,
                                                        paddingBottom: 1,
                                                        width: 'max-content',
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    <span style={{ color: 'rgb(116,66,16)' }}>BETA</span>
                                                </div>
                                            </Tabs>
                                        )}

                                        <Divider />
                                    </Box>
                                    <PerfectScrollbar
                                        containerRef={(el) => {
                                            ps.current = el
                                        }}
                                        style={{
                                            height: '100%',
                                            maxHeight: `calc(100vh - ${isAgentCanvas ? '300' : '380'}px)`,
                                            overflowX: 'hidden'
                                        }}
                                    >
                                        <Box sx={{ p: 2, pt: 0 }}>
                                            <List
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 370,
                                                    py: 0,
                                                    borderRadius: '10px',
                                                    [theme.breakpoints.down('md')]: {
                                                        maxWidth: 370
                                                    },
                                                    '& .MuiListItemSecondaryAction-root': {
                                                        top: 22
                                                    },
                                                    '& .MuiDivider-root': {
                                                        my: 0
                                                    },
                                                    '& .list-container': {
                                                        pl: 7
                                                    }
                                                }}
                                            >
                                                {Object.keys(nodes)
                                                    .sort()
                                                    .map((category) =>
                                                        category === 'Vector Stores' ? (
                                                            <></>
                                                        ) : (
                                                            <Accordion
                                                                expanded={categoryExpanded[category] || false}
                                                                onChange={handleAccordionChange(category)}
                                                                key={category}
                                                                disableGutters
                                                            >
                                                                <AccordionSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls={`nodes-accordian-${category}`}
                                                                    id={`nodes-accordian-header-${category}`}
                                                                >
                                                                    {category.split(';').length > 1 ? (
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                flexDirection: 'row',
                                                                                alignItems: 'center'
                                                                            }}
                                                                        >
                                                                            <Typography variant='h5'>{category.split(';')[0]}</Typography>
                                                                            &nbsp;
                                                                            <Chip
                                                                                sx={{
                                                                                    width: 'max-content',
                                                                                    fontWeight: 700,
                                                                                    fontSize: '0.65rem',
                                                                                    background:
                                                                                        category.split(';')[1] === 'DEPRECATING'
                                                                                            ? theme.palette.warning.main
                                                                                            : theme.palette.teal.main,
                                                                                    color:
                                                                                        category.split(';')[1] !== 'DEPRECATING'
                                                                                            ? 'white'
                                                                                            : 'inherit'
                                                                                }}
                                                                                size='small'
                                                                                label={
                                                                                    category.split(';')[1] === 'DEPRECATING'
                                                                                        ? 'УСТАРЕЛ'
                                                                                        : category.split(';')[1] === 'NEW'
                                                                                        ? 'НОВЫЙ'
                                                                                        : category.split(';')[1]
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <Typography variant='h5'>
                                                                            {translationsNodes[category] || category}
                                                                        </Typography>
                                                                    )}
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {nodes[category].map(
                                                                        (node, index) =>
                                                                            !excludedNodesByLable.includes(node.label) && (
                                                                                <div
                                                                                    key={node.name}
                                                                                    onDragStart={(event) => onDragStart(event, node)}
                                                                                    draggable
                                                                                >
                                                                                    <ListItemButton
                                                                                        sx={{
                                                                                            p: 0,
                                                                                            borderRadius: `${customization.borderRadius}px`,
                                                                                            cursor: 'move'
                                                                                        }}
                                                                                    >
                                                                                        <ListItem alignItems='center'>
                                                                                            <ListItemAvatar>
                                                                                                <div
                                                                                                    style={{
                                                                                                        width: 50,
                                                                                                        height: 50,
                                                                                                        borderRadius: '50%',
                                                                                                        backgroundColor: 'white'
                                                                                                    }}
                                                                                                >
                                                                                                    <img
                                                                                                        style={{
                                                                                                            width: '100%',
                                                                                                            height: '100%',
                                                                                                            padding: 10,
                                                                                                            objectFit: 'contain'
                                                                                                        }}
                                                                                                        alt={node.name}
                                                                                                        src={`${baseURL}/api/v1/node-icon/${node.name}`}
                                                                                                    />
                                                                                                </div>
                                                                                            </ListItemAvatar>
                                                                                            <ListItemText
                                                                                                sx={{ ml: 1 }}
                                                                                                primary={
                                                                                                    <div
                                                                                                        style={{
                                                                                                            display: 'flex',
                                                                                                            flexDirection: 'row',
                                                                                                            alignItems: 'center'
                                                                                                        }}
                                                                                                    >
                                                                                                        <span>{node.label}</span>
                                                                                                        &nbsp;
                                                                                                        {node.badge && (
                                                                                                            <Chip
                                                                                                                sx={{
                                                                                                                    width: 'max-content',
                                                                                                                    fontWeight: 700,
                                                                                                                    fontSize: '0.65rem',
                                                                                                                    background:
                                                                                                                        node.badge ===
                                                                                                                        'DEPRECATING'
                                                                                                                            ? theme.palette
                                                                                                                                  .warning
                                                                                                                                  .main
                                                                                                                            : theme.palette
                                                                                                                                  .teal
                                                                                                                                  .main,
                                                                                                                    color:
                                                                                                                        node.badge !==
                                                                                                                        'DEPRECATING'
                                                                                                                            ? 'white'
                                                                                                                            : 'inherit'
                                                                                                                }}
                                                                                                                size='small'
                                                                                                                label={
                                                                                                                    node.badge ===
                                                                                                                    'DEPRECATING'
                                                                                                                        ? 'УСТАРЕЛ'
                                                                                                                        : node.badge ===
                                                                                                                          'NEW'
                                                                                                                        ? 'НОВЫЙ'
                                                                                                                        : node.badge
                                                                                                                }
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                }
                                                                                                secondary={
                                                                                                    translationObject[node.description] ||
                                                                                                    node.description
                                                                                                }
                                                                                            />
                                                                                        </ListItem>
                                                                                    </ListItemButton>
                                                                                    {index === nodes[category].length - 1 ? null : (
                                                                                        <Divider />
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                    )}
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        )
                                                    )}
                                            </List>
                                        </Box>
                                    </PerfectScrollbar>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </>
    )
}

AddNodes.propTypes = {
    nodesData: PropTypes.array,
    node: PropTypes.object,
    isAgentCanvas: PropTypes.bool
}

export default AddNodes
