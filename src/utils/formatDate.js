export default function formatDate(date){
    let pad = num => num < 10 ? '0' + num : num;
    return `${pad(date.getMonth() + 1)}\\${pad(date.getDate())}\\${date.getFullYear()}`;
}
