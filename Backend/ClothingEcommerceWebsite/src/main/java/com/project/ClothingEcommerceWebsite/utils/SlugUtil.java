package com.project.ClothingEcommerceWebsite.utils;

import java.text.Normalizer;
import java.util.Locale;

public class SlugUtil {
    public static String toSlug(String s) {
        if (s == null) return "";
        s = s.trim();
        s = Normalizer.normalize(s, Normalizer.Form.NFD);
        s = s.replace('đ', 'd').replace('Đ', 'D');
        s = s.replaceAll("\\p{M}+", "");
        s = s.toLowerCase(Locale.ROOT);
        s = s.replaceAll("[^a-z0-9]+", "-");
        s = s.replaceAll("^-+|-+$", "").replaceAll("-{2,}", "-");
        return s;
    }
}
