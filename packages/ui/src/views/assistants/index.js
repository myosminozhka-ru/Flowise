import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// material-ui
import { Grid, Box, Stack, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from 'ui-component/cards/MainCard'
import ItemCard from 'ui-component/cards/ItemCard'
import { gridSpacing } from 'store/constant'
import AssistantEmptySvg from 'assets/images/assistant_empty_startai.svg'
import { StyledButton } from 'ui-component/button/StyledButton'
import AssistantDialog from './AssistantDialog'
import LoadAssistantDialog from './LoadAssistantDialog'

// API
import assistantsApi from 'api/assistants'

// Hooks
import useApi from 'hooks/useApi'

// icons
import { IconPlus, IconFileImport } from '@tabler/icons'

// ==============================|| CHATFLOWS ||============================== //

const Assistants = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const getAllAssistantsApi = useApi(assistantsApi.getAllAssistants)

    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [showLoadDialog, setShowLoadDialog] = useState(false)
    const [loadDialogProps, setLoadDialogProps] = useState({})

    const loadExisting = () => {
        const dialogProp = {
            title: 'Загрузить существующий ассистент'
        }
        setLoadDialogProps(dialogProp)
        setShowLoadDialog(true)
    }

    const onAssistantSelected = (selectedOpenAIAssistantId, credential) => {
        setShowLoadDialog(false)
        addNew(selectedOpenAIAssistantId, credential)
    }

    const addNew = (selectedOpenAIAssistantId, credential) => {
        const dialogProp = {
            title: 'Создать нового ассистента',
            type: 'ADD',
            cancelButtonName: 'Отмена',
            confirmButtonName: 'Добавить',
            selectedOpenAIAssistantId,
            credential
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const edit = (selectedAssistant) => {
        const dialogProp = {
            title: 'Изменить',
            type: 'EDIT',
            cancelButtonName: 'Отмена',
            confirmButtonName: 'Сохранить',
            data: selectedAssistant
        }
        setDialogProps(dialogProp)
        setShowDialog(true)
    }

    const onConfirm = () => {
        setShowDialog(false)
        getAllAssistantsApi.request()
    }

    useEffect(() => {
        getAllAssistantsApi.request()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '' }}>
                <Stack flexDirection='row'>
                    <Grid sx={{ mb: 1.25 }} container direction='row'>
                        <h1>OpenAI Ассистенты</h1>
                        <Box sx={{ flexGrow: 1 }} />
                        <Grid item>
                            <Button
                                variant='outlined'
                                sx={{ mr: 2, borderRadius: '12px' }}
                                onClick={loadExisting}
                                startIcon={<IconFileImport />}
                            >
                                Загрузить
                            </Button>
                            <StyledButton
                                variant='contained'
                                sx={{ color: 'white', borderRadius: '12px' }}
                                onClick={addNew}
                                startIcon={<IconPlus />}
                            >
                                Добавить
                            </StyledButton>
                        </Grid>
                    </Grid>
                </Stack>
                <Grid container spacing={gridSpacing}>
                    {!getAllAssistantsApi.loading &&
                        getAllAssistantsApi.data &&
                        getAllAssistantsApi.data.map((data, index) => (
                            <Grid key={index} item lg={3} md={4} sm={6} xs={12}>
                                <ItemCard
                                    data={{
                                        name: JSON.parse(data.details)?.name,
                                        description: JSON.parse(data.details)?.instructions,
                                        iconSrc: data.iconSrc
                                    }}
                                    onClick={() => edit(data)}
                                />
                            </Grid>
                        ))}
                </Grid>
                {!getAllAssistantsApi.loading && (!getAllAssistantsApi.data || getAllAssistantsApi.data.length === 0) && (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                        <Box sx={{ p: 2, height: 'auto' }}>
                            <img
                                style={{ objectFit: 'cover', height: '30vh', width: 'auto' }}
                                src={AssistantEmptySvg}
                                alt='AssistantEmptySvg'
                            />
                        </Box>
                        <div>Ассистентов еще нет</div>
                    </Stack>
                )}
            </MainCard>
            <LoadAssistantDialog
                show={showLoadDialog}
                dialogProps={loadDialogProps}
                onCancel={() => setShowLoadDialog(false)}
                onAssistantSelected={onAssistantSelected}
            ></LoadAssistantDialog>
            <AssistantDialog
                show={showDialog}
                dialogProps={dialogProps}
                onCancel={() => setShowDialog(false)}
                onConfirm={onConfirm}
            ></AssistantDialog>
        </>
    )
}

export default Assistants