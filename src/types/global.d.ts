// 声明 MD 文件模块，导入后为字符串类型
declare module "*.md" {
  const content: string;
  export default content;
}
