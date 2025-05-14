import { useEffect, useState } from 'react';
import i18n from "@/utils/i18n";
import { Dropdown, Typography, Icon } from "@douyinfe/semi-ui";
import { IconGlobe } from "@douyinfe/semi-icons";

const Lang = [
  { lang: "zh", text: "中文" },
  { lang: "en", text: "English" },
];

interface ChangeLangProps {
  style?: React.CSSProperties;
}

export const ChangeLang: React.FC<ChangeLangProps> = (props) => {
  const { Title } = Typography;
  const { style } = props;

  // 强制组件在语言变化时更新
  const [langCode, setLangCode] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLangCode(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const currentLangText = Lang.find((item) => item.lang === langCode)?.text ?? "Unknown";

  return (
    <div style={style}>
      <Dropdown
        position="bottom"
        render={
          <Dropdown.Menu style={{ minWidth: "120px", padding: "8px 0" }}>
            {Lang.map((item) => (
              <Dropdown.Item
                style={{ padding: "8px 16px", borderRadius: "4px" }}
                key={item.lang}
                onClick={() => {
                  i18n.changeLanguage(item.lang);
                }}
              >
                {item.text}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconGlobe style={{ fontSize: "16px" }} />
          <Title heading={6}>{currentLangText}</Title>
        </div>
      </Dropdown>
    </div>
  );
};
