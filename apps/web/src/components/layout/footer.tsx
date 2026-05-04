import { Clock } from "lucide-react";
import { SocialIcon } from "react-social-icons";

export default function Footer() {
  return (
    <footer className="text-background bg-marca grid grid-cols-2 items-center justify-items-center gap-4 rounded-t-4xl p-4 py-8">
      <section className="col-span-1 flex w-full items-center justify-center gap-2">
        <SocialIcon
          url="https://wa.me/+54-3518562095"
          style={{ scale: 0.8 }}
          target="_blank"
        />
        <SocialIcon
          url="https://www.instagram.com/santiagoemanuel.jsx/"
          style={{ scale: 0.8 }}
          target="_blank"
        />
      </section>
      <section className="col-span-1 flex w-full flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-1 font-bold">
          <Clock />
          <h2>Horarios</h2>
        </div>
        <div className="text-sm">
          <p>9:00hs - 13:00hs</p>
          <p>17:00hs - 22:00hs</p>
        </div>
      </section>
    </footer>
  );
}
