import path from 'path';

export default (filePath: string) => path.parse(path.basename(filePath)).name;