use wasm_bindgen::prelude::*;

/// Version of the browser-side Rust core.
#[wasm_bindgen]
pub fn core_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Clamp a user-supplied audio gain to a safe UI range (0.0..=2.0).
#[wasm_bindgen]
pub fn clamp_audio_gain(gain: f32) -> f32 {
    if !gain.is_finite() {
        return 1.0;
    }
    gain.clamp(0.0, 2.0)
}

/// Convert a requested canvas size to a bounded 16:9 output size.
/// This helper does not encode or transmit video.
#[wasm_bindgen]
pub fn output_width(requested_width: u32) -> u32 {
    let width = requested_width.clamp(320, 1920);
    (width / 16) * 16
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gain_is_clamped() {
        assert_eq!(clamp_audio_gain(-3.0), 0.0);
        assert_eq!(clamp_audio_gain(9.0), 2.0);
        assert_eq!(clamp_audio_gain(f32::NAN), 1.0);
    }

    #[test]
    fn width_is_bounded_and_aligned() {
        assert_eq!(output_width(10), 320);
        assert_eq!(output_width(1920), 1920);
        assert_eq!(output_width(1000), 992);
    }
}