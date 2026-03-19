import { useLoaderData, Link } from "react-router";

interface MarkdownMeta {
  id: string;
  title: string;
  date: string;
  desc: string;
}

const MarkdownList = () => {
  const { postsMeta } = useLoaderData<{ postsMeta: MarkdownMeta[] }>();

  return (
    <>
      <meta name="description" content="某人的奇怪知识点;开发知识点;知识点;开发踩坑;" />

      <div>
        <h1>
          某人的奇怪知识点
          <em style={{ marginLeft: "3em", fontSize: 16, fontWeight: 400 }}>
            共{postsMeta.length}篇文章
          </em>
        </h1>
        <br />
        {postsMeta.map((node) => (
          <div key={node.id}>
            <h3
              style={{
                marginBottom: 12,
              }}
            >
              <Link to={node.id}>{node.title}</Link>
              &nbsp;
              <span
                style={{
                  color: "#bbb",
                }}
              >
                — {node.date}
              </span>
            </h3>
            <p>{node?.desc ?? "--"}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default MarkdownList;
