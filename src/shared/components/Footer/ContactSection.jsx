import React, { useState } from "react";
import { Send, Facebook, Youtube } from "lucide-react";
import { SiZalo } from "react-icons/si";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import TextInput from "@/shared/components/ui/inputs/TextInput.jsx";
import { useSubmitContactMutation } from "@/store/api/contactApi";
import Modal from "../ui/Modal";

const ContactSection = ({ isMobile = false }) => {
  const { t, language } = useLanguage();
  const footerText = t.footer;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
  });
  const [submitContact, { isLoading }] = useSubmitContactMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) {
      setModal({
        open: true,
        title: footerText.validation.title,
        message: footerText.validation.message,
      });
      return;
    }

    try {
      await submitContact({ email, name, message, language }).unwrap();

      setModal({
        open: true,
        title: footerText.success.title,
        message: footerText.success.message,
      });

      setEmail("");
      setName("");
      setMessage("");
    } catch (err) {
      setModal({
        open: true,
        title: footerText.error.title,
        message: footerText.error.message,
      });

      console.error(err);
    }
  };

  return (
    <>
      <div className="flex-1 w-full flex flex-col items-center lg:items-end z-30">
        <h2
          className={`font-bold tracking-wide uppercase text-center w-full max-w-md text-lg mb-4 ${isMobile ? "text-[#910B09] text-2xl" : ""}`}
        >
          {footerText.contactUs}
        </h2>

        <div className="flex justify-center gap-6 mb-6 w-full max-w-md pl-4">
          <a
            href="https://www.facebook.com/share/1DzTNUSEAN/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <Facebook size={32} />
          </a>
          <a
            href="https://www.youtube.com/@CatSpeak-VN"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <Youtube size={32} />
          </a>
          <a
            href="https://zalo.me/g/gffkqu214"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#910B09] shadow-lg transition-all duration-300 hover:bg-[#910B09] hover:text-white"
          >
            <SiZalo size={32} />
          </a>
        </div>

        <div className="w-full max-w-md z-30">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <TextInput
                type="email"
                placeholder={footerText.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                containerClassName="flex-1"
                className={`text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />
              <TextInput
                placeholder={footerText.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                containerClassName="flex-1"
                className={`text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />
            </div>
            <div className="flex items-center relative gap-5">
              <TextInput
                placeholder={footerText.contactPlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                containerClassName="flex-1"
                className={`pr-12 text-black ${isMobile ? "shadow-md bg-white border border-gray-100 rounded-full px-6 py-2" : ""}`}
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                  isMobile
                    ? "bg-[#910B09] text-[#FFE66D] hover:bg-[#7a0907]"
                    : "border border-[#FFE66D] text-[#FFE66D] hover:bg-[#b6a13a] hover:text-white"
                }`}
                aria-label={footerText.sendContact}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-center text-sm">
            <div
              className={`flex-1 text-center sm:text-left ${isMobile ? "text-[#910B09]" : "text-white/90"}`}
            >
              <span className="font-black italic text-base">Cat Speak </span>
              <span className="text-sm italic">
                {footerText.contactMessage}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Noti */}
      <Modal
        open={modal.open}
        onClose={() =>
          setModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        title={modal.title}
      >
        <div className="py-2">
          <p className="text-gray-700">{modal.message}</p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() =>
                setModal((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
              className="rounded-full bg-[#910B09] px-6 py-2 text-white hover:bg-[#7a0907]"
            >
              {footerText.ok}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ContactSection;
