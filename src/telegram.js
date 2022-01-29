import axios from 'axios';
import config from './config';

export const sendTelegramMessage = async (text) => {
    return true;
    const res = await axios.get(`https://api.telegram.org/bot${config.TG_API_TOKEN}/sendMessage`, {
        params: {
            chat_id: config.TG_CHAT_ID,
            parse_mode: 'markdown',
            text
        }
    });

    return res?.data?.ok;
}