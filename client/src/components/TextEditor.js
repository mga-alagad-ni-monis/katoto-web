import { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

import axios from "../api/axios";

function TextEditor({
  addCampaignInfo,
  setAddCampaignInfo,
  auth,
  setImageHeader,
  setDescription,
}) {
  const [isImageHeader, setIsImageHeader] = useState(true);

  const editorRef = useRef(null);

  const log = () => {
    if (editorRef.current) {
      setAddCampaignInfo(editorRef.current.getContent());
      setDescription(editorRef.current.getContent({ format: "text" }));
    }
  };

  return (
    <>
      <Editor
        apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={addCampaignInfo}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "autoresize",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help | autoresize",
          file_picker_types: "file image media",
          convert_urls: false,
          images_upload_handler: async function (blobInfo, success, failure) {
            let imageFile = new FormData();
            imageFile.append("files[]", blobInfo.blob());
            console.log(imageFile);
            try {
              const { data } = await axios.post(
                "/api/campaigns/upload",
                imageFile,
                {
                  withCredentials: true,
                  headers: {
                    Authorization: `Bearer ${auth?.accessToken}`,
                  },
                }
              );
              console.log(data);
              editorRef.current.execCommand(
                "mceInsertContent",
                false,
                `<img src='${data}' />`
              );
              if (isImageHeader) {
                setImageHeader(data);
                setIsImageHeader(false);
              }
              success(data);
            } catch (err) {
              console.log(err);
              return;
            }
          },

          content_style:
            "body { font-family:inter; font-size:16px; min-height:500px; }",
          branding: false,
          statusbar: false,
          setup: function (editor) {
            editor.on("Paste Change input Undo Redo", function () {
              log();
            });
          },
        }}
      />
    </>
  );
}

export default TextEditor;
