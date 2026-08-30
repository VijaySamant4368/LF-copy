import { Facebook, ThumbsUp, UserPlus, Youtube } from "lucide-react";

export function SocialFollowWidget() {
  return (
    <div className="w-full space-y-2.5 font-sans">
      <a href="https://facebook.com/lawsforum" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#1855B6] hover:bg-[#124294] text-white px-4 py-3 font-bold text-xs sm:text-[13px] tracking-wide uppercase transition-colors shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Facebook className="w-4 h-4 fill-white" />
          <span>FACEBOOK</span>
        </div>
        <div className="flex items-center space-x-1 text-xs opacity-90">
          <ThumbsUp className="w-3.5 h-3.5 fill-white" />
          <span>LIKE</span>
        </div>
      </a>

      <a href="https://twitter.com/lawsforum" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#29B6F6] hover:bg-[#039BE5] text-white px-4 py-3 font-bold text-xs sm:text-[13px] tracking-wide uppercase transition-colors shadow-sm">
        <div className="flex items-center space-x-2.5">
          <span className="font-bold text-sm">𝕏</span>
          <span>TWITTER</span>
        </div>
        <div className="flex items-center space-x-1 text-xs opacity-90">
          <UserPlus className="w-3.5 h-3.5" />
          <span>FOLLOW</span>
        </div>
      </a>

      <a href="https://youtube.com/lawsforum" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#CC181E] hover:bg-[#B31217] text-white px-4 py-3 font-bold text-xs sm:text-[13px] tracking-wide uppercase transition-colors shadow-sm">
        <div className="flex items-center space-x-2.5">
          <Youtube className="w-4 h-4 fill-white" />
          <span>YOUTUBE</span>
        </div>
        <div className="flex items-center space-x-1 text-xs opacity-90">
          <UserPlus className="w-3.5 h-3.5" />
          <span>SUBSCRIBE</span>
        </div>
      </a>
    </div>
  );
}
