<?php
/**
 * Comments Template
 *
 * @package FIM_Theme
 */

if (!defined('ABSPATH')) {
    exit;
}

// If the current post is protected by a password and the visitor has not yet entered the password
if (post_password_required()) {
    return;
}
?>

<div id="comments" class="comments-area">
    <?php if (have_comments()): ?>
    
    <h2 class="comments-title">
        <?php
        $comment_count = get_comments_number();
        if ('1' === $comment_count) {
            printf(__('1 Komentar', 'fim-theme'));
        } else {
            printf(__('%s Komentar', 'fim-theme'), number_format_i18n($comment_count));
        }
        ?>
    </h2>

    <ol class="comment-list">
        <?php
        wp_list_comments(array(
            'style' => 'ol',
            'short_ping' => true,
            'avatar_size' => 60,
            'callback' => 'fim_comment_template',
        ));
        ?>
    </ol>

    <?php
    the_comments_navigation(array(
        'prev_text' => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Komentar Sebelumnya',
        'next_text' => 'Komentar Selanjutnya <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
    ));
    ?>

    <?php if (!comments_open()): ?>
    <p class="no-comments"><?php esc_html_e('Komentar ditutup.', 'fim-theme'); ?></p>
    <?php endif; ?>

    <?php endif; ?>

    <?php
    comment_form(array(
        'title_reply' => __('Tinggalkan Komentar', 'fim-theme'),
        'title_reply_to' => __('Balas Komentar %s', 'fim-theme'),
        'cancel_reply_link' => __('Batal', 'fim-theme'),
        'label_submit' => __('Kirim Komentar', 'fim-theme'),
        'comment_field' => '<div class="comment-form-comment"><label for="comment">' . __('Komentar', 'fim-theme') . '</label><textarea id="comment" name="comment" cols="45" rows="6" required></textarea></div>',
        'class_form' => 'comment-form',
        'class_submit' => 'btn btn-primary',
    ));
    ?>
</div>

<?php
/**
 * Custom comment template
 */
function fim_comment_template($comment, $args, $depth) {
    $GLOBALS['comment'] = $comment;
    ?>
    <li <?php comment_class('comment-item'); ?> id="comment-<?php comment_ID(); ?>">
        <article class="comment-body">
            <header class="comment-meta">
                <div class="comment-author vcard">
                    <?php echo get_avatar($comment, 60); ?>
                    <div class="comment-author-info">
                        <span class="fn"><?php echo get_comment_author_link(); ?></span>
                        <time datetime="<?php comment_time('c'); ?>">
                            <?php printf(__('%1$s pada %2$s', 'fim-theme'), get_comment_date(), get_comment_time()); ?>
                        </time>
                    </div>
                </div>
            </header>

            <div class="comment-content">
                <?php comment_text(); ?>
            </div>

            <footer class="comment-actions">
                <?php
                comment_reply_link(array_merge($args, array(
                    'depth' => $depth,
                    'max_depth' => $args['max_depth'],
                    'before' => '<span class="reply-link">',
                    'after' => '</span>',
                )));
                ?>
                <?php edit_comment_link(__('Edit', 'fim-theme'), '<span class="edit-link">', '</span>'); ?>
            </footer>

            <?php if ('0' == $comment->comment_approved): ?>
            <p class="comment-awaiting-moderation"><?php esc_html_e('Komentar Anda sedang menunggu moderasi.', 'fim-theme'); ?></p>
            <?php endif; ?>
        </article>
    </li>
    <?php
}
?>
