import Image from "next/image";
import styles from "./page.module.css";
import Editor from "@/app/components/Editor";

export default function Home() {
  return (
    <div>
      <h1>Real-Time Collaborative Editor</h1>
      <Editor/>
    </div>
  );
}
