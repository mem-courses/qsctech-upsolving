# Markdown

[DEMO](https://mem-courses.github.io/qsctech-upsolving/markdown/)

设计实现一个 Markdown 编辑器。点击右上角 `加载示例` 加载示例文档。

### 特性

- 支持常见 Markdown 语法，具体可以参考示例文档中的演示内容。
- 支持数学公式
- 支持导出为 HTML、PDF 等常用格式

### 心得感受

本项目中，我完成并实现了一个 Markdown 编辑器。

渲染函数的实现上，为了简化代码，我选择了一个时间复杂度 O(n^2) 的递归实现。在实际场景中，其运行速度良好。并且具有良好的拓展性。我的实现能很好的支持引用块嵌套等较为复杂的 Markdown 语法。

同时，我还实现了一些常用 Markdown 编辑器可能提供的其他功能，如导出为 PDF 和 HTML 等。这一部分我主要参考了[我在另一个项目中的实现](https://github.com/memset0/weixin-print-to-pdf/blob/3d92c649ee0078147c38629ba1700fa033c79a32/index.js#L170-L207)。

总的来说，这道题目作为一个前端项目而言并不复杂，核心部分代码的完成只用了一节微积分课的时间。由于只使用了原生 Javascript 编写，这一项目也能较好的藕合到其他项目中去。