// saveAsText.js
const fs = require('fs');
const path = require('path');

const projectDir = __dirname; // Diretório atual do arquivo em execução
const backendDir = path.join(projectDir, 'backend');
const frontendDir = path.join(projectDir, 'frontend');
const backendOutputFile = path.join(projectDir, 'backend.txt');
const frontendOutputFile = path.join(projectDir, 'frontend.txt');
const treeOutputFile = path.join(projectDir, 'tree.txt');

// Extensões permitidas
const allowedExtensions = ['.html', '.css', '.js'];
// Diretórios a serem ignorados
const ignoredDirs = ['node_modules', '.git', '.env'];

// Função para listar arquivos, ignorando diretórios especificados
function listFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);

        // Ignorar diretórios especificados
        if (ignoredDirs.includes(file)) {
            return; // Pule para o próximo
        }

        const ext = path.extname(file); // Obtém a extensão do arquivo
        if (fs.statSync(filePath).isDirectory()) {
            listFiles(filePath, fileList); // Recursão para subpastas
        } else if (allowedExtensions.includes(ext)) {
            fileList.push(filePath); // Adiciona arquivos permitidos à lista
        }
    });
    return fileList;
}

// Função para gerar conteúdo do arquivo de saída
function generateOutput(fileList, outputFile, projectDir) {
    const output = fileList.map(filePath => {
        const relativePath = path.relative(projectDir, filePath);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return `// ${relativePath}\n\n${fileContent}\n`;
    }).join('\n\n');
    fs.writeFileSync(outputFile, output);
    console.log(`Estrutura salva em ${outputFile}`);
}

// Função para listar arquivos no diretório raiz
function listRootFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(item => !item.isDirectory() && !ignoredDirs.includes(item.name))
        .map(file => file.name);
}

// Função para criar a estrutura de 'tree' (arquivos e subdiretórios)
function generateTree(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let treeOutput = '';

    entries.forEach((entry, index) => {
        // Ignorar diretórios especificados
        if (ignoredDirs.includes(entry.name)) {
            return;
        }

        const isLast = index === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        treeOutput += `${prefix}${connector}${entry.name}\n`;

        if (entry.isDirectory()) {
            const subDir = path.join(dir, entry.name);
            const subPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
            treeOutput += generateTree(subDir, subPrefix); // Recurse para subdiretórios
        }
    });

    return treeOutput;
}

// Função para gerar o arquivo tree.txt
function generateTreeFile(treeFile, projectDir) {
    let treeContent = `cd /d "${projectDir}"\n\n`;

    // Lista os arquivos no diretório raiz
    treeContent += 'REM Lista os arquivos apenas no diretório raiz do projeto\n';
    treeContent += 'Lista de Arquivos no Diretório Principal:\n';
    treeContent += listRootFiles(projectDir).join('\n') + '\n';
    treeContent += 'backend\nfrontend\n\n'; // node_modules ignorado explicitamente

    // Lista os arquivos na pasta frontend
    if (fs.existsSync(frontendDir)) {
        treeContent += 'REM Lista os arquivos na pasta frontend\n';
        treeContent += 'Lista de Arquivos na Pasta "frontend":\n';
        treeContent += generateTree(frontendDir) + '\n';
    }

    // Lista os arquivos na pasta backend
    if (fs.existsSync(backendDir)) {
        treeContent += 'REM Lista os arquivos na pasta backend\n';
        treeContent += 'Lista de Arquivos na Pasta "backend":\n';
        treeContent += generateTree(backendDir) + '\n';
    }

    fs.writeFileSync(treeFile, treeContent);
    console.log(`Estrutura tree salva em ${treeFile}`);
}

// Gera os arquivos para backend e frontend
const backendFiles = listFiles(backendDir);
const frontendFiles = listFiles(frontendDir);

generateOutput(backendFiles, backendOutputFile, projectDir);
generateOutput(frontendFiles, frontendOutputFile, projectDir);

// Gera o arquivo tree.txt
generateTreeFile(treeOutputFile, projectDir);
