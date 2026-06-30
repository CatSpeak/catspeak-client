import { Link } from "react-router-dom";
import { LandingPageLogo } from "../../assets";

const LandingHeaderLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center" aria-label="Cat Speak Home">
        {/* Compact mark on small screens — matches header control scale (~36px) */}
        {/* <img
          src={IconLogo}
          alt=""
          width={36}
          height={36}
          className="h-8 w-8 shrink-0 sm:h-9 sm:w-9 "
          draggable={false}
        /> */}
        <img
          src={LandingPageLogo}
          alt="Cat Speak logo"
          className="h-10 w-auto lg:block"
          draggable={false}
        />
      </Link>
    </div>
  );
};

export default LandingHeaderLogo;
