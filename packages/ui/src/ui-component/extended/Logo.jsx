import startLogo from '@/assets/images/start_logo.png'

import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <img
                style={{ objectFit: 'contain', height: 'auto', width: 110 }}
                src={customization.isDarkMode ? startLogo : startLogo}
                alt='StartAI'
            />
        </div>
    )
}

export default Logo
