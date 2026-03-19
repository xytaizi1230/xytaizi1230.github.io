import { useLoaderData } from "react-router";
import MarkdownPreview from "../../../components/MarkdownPreview";

const MarkdownPage = () => {
  const { mdContent, desc } = useLoaderData<{
    mdContent: string;
    desc: string;
  }>();

  return (
    <>
      <meta name="description" content={desc} />
      <h1>{document.title}</h1>
      <p>{desc}</p>
      <hr />
      <MarkdownPreview mdContent={mdContent} />
    </>
  );
};

export default MarkdownPage;
